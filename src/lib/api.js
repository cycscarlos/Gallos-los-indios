import { supabase, withTimeout } from './supabase.js';

export const API = {

    ejemplares: {

        async getAll(filters = {}) {
            let query = supabase
                .from('ejemplares')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters.estado) {
                query = query.eq('estado', filters.estado);
            }
            if (filters.genero) {
                query = query.eq('genero', filters.genero);
            }
            if (filters.linea) {
                query = query.eq('linea', filters.linea);
            }

            return withTimeout(query);
        },

        async getById(id) {
            return withTimeout(
                supabase
                    .from('ejemplares')
                    .select('*')
                    .eq('id', id)
                    .single()
            );
        },

        async create(ejemplar) {
            return withTimeout(
                supabase
                    .from('ejemplares')
                    .insert([ejemplar])
                    .select()
            );
        },

        async update(id, updates) {
            return withTimeout(
                supabase
                    .from('ejemplares')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single()
            );
        },

        async delete(id) {
            return withTimeout(
                supabase
                    .from('ejemplares')
                    .delete()
                    .eq('id', id)
            );
        },

        async uploadImage(file, ejemplarId) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${ejemplarId}_${Date.now()}.${fileExt}`;
            const path = `imagenes/${fileName}`;

            const uploadResult = await withTimeout(
                supabase.storage
                    .from('ejemplares')
                    .upload(path, file)
            );

            if (uploadResult.error) {
                return { error: uploadResult.error };
            }

            const { data: { publicUrl } } = supabase.storage
                .from('ejemplares')
                .getPublicUrl(path);

            return { publicUrl, error: null };
        }
    },

    consultas: {

        async getAll(filters = {}) {
            let query = supabase
                .from('consultas')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters.leido !== undefined) {
                query = query.eq('leido', filters.leido);
            }
            if (filters.respondida !== undefined) {
                query = query.eq('respondida', filters.respondida);
            }

            return withTimeout(query);
        },

        async getById(id) {
            return withTimeout(
                supabase
                    .from('consultas')
                    .select('*')
                    .eq('id', id)
                    .single()
            );
        },

        async create(consulta) {
            return withTimeout(
                supabase
                    .from('consultas')
                    .insert(consulta)
                    .select()
                    .single()
            );
        },

        async markAsRead(id) {
            return withTimeout(
                supabase
                    .from('consultas')
                    .update({ leido: true })
                    .eq('id', id)
                    .select()
                    .single()
            );
        },

        async markAsResponded(id) {
            return withTimeout(
                supabase
                    .from('consultas')
                    .update({ respondida: true })
                    .eq('id', id)
                    .select()
                    .single()
            );
        },

        async delete(id) {
            return withTimeout(
                supabase
                    .from('consultas')
                    .delete()
                    .eq('id', id)
            );
        },

        async getStats() {
            const { data, error } = await withTimeout(
                supabase
                    .from('consultas')
                    .select('leido, respondida')
            );

            if (error) return { data: null, error };

            const total = data.length;
            const leidos = data.filter(c => c.leido).length;
            const respondidas = data.filter(c => c.respondida).length;

            return {
                data: {
                    total,
                    leidos,
                    noLeidos: total - leidos,
                    respondidas,
                    pendientes: total - respondidas
                },
                error: null
            };
        }
    },

    usuarios: {

        async getAll() {
            return withTimeout(
                supabase
                    .from('usuarios')
                    .select('*')
                    .order('created_at', { ascending: false })
            );
        },

        async getById(id) {
            return withTimeout(
                supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', id)
                    .single()
            );
        },

        async update(id, updates) {
            return withTimeout(
                supabase
                    .from('usuarios')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single()
            );
        },

        async updateRole(id, rol) {
            return this.update(id, { rol });
        },

        async toggleActive(id, activo) {
            return this.update(id, { activo });
        },

        async delete(id) {
            return withTimeout(
                supabase
                    .from('usuarios')
                    .delete()
                    .eq('id', id)
            );
        }
    },

    storage: {

        async uploadImage(bucket, path, file) {
            const uploadResult = await withTimeout(
                supabase.storage
                    .from(bucket)
                    .upload(path, file, {
                        cacheControl: '3600',
                        upsert: false
                    })
            );

            if (uploadResult.error) {
                return { error: uploadResult.error };
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);

            return { publicUrl, error: null };
        },

        async deleteImage(bucket, path) {
            return withTimeout(
                supabase.storage
                    .from(bucket)
                    .remove([path])
            );
        }
    }
};

export default API;
