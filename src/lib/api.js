import { supabase } from './supabase.js';

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

            const { data, error } = await query;
            return { data, error };
        },

        async getById(id) {
            const { data, error } = await supabase
                .from('ejemplares')
                .select('*')
                .eq('id', id)
                .single();
            return { data, error };
        },

        async create(ejemplar) {
            console.log("Intentando crear ejemplar:", ejemplar);
            try {
                const req = supabase.from('ejemplares').insert([ejemplar]).select();
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase tardó más de 5 segundos (Posible bloqueo de red/Adblock)")), 5000));
                
                const { data, error } = await Promise.race([req, timeout]);
                if (error) console.error("API Insert Error:", error);
                
                return { data, error };
            } catch (err) {
                console.error("Excepción en inserción:", err);
                return { data: null, error: err };
            }
        },

        async update(id, updates) {
            const { data, error } = await supabase
                .from('ejemplares')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        },

        async delete(id) {
            const { error } = await supabase
                .from('ejemplares')
                .delete()
                .eq('id', id);
            return { error };
        },

        async uploadImage(file, ejemplarId) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${ejemplarId}_${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('ejemplares')
                .upload(`imagenes/${fileName}`, file);

            if (error) {
                return { error };
            }

            const { data: { publicUrl } } = supabase.storage
                .from('ejemplares')
                .getPublicUrl(`imagenes/${fileName}`);

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

            const { data, error } = await query;
            return { data, error };
        },

        async getById(id) {
            const { data, error } = await supabase
                .from('consultas')
                .select('*')
                .eq('id', id)
                .single();
            return { data, error };
        },

        async create(consulta) {
            const { data, error } = await supabase
                .from('consultas')
                .insert(consulta)
                .select()
                .single();
            return { data, error };
        },

        async markAsRead(id) {
            const { data, error } = await supabase
                .from('consultas')
                .update({ leido: true })
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        },

        async markAsResponded(id) {
            const { data, error } = await supabase
                .from('consultas')
                .update({ respondida: true })
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        },

        async delete(id) {
            const { error } = await supabase
                .from('consultas')
                .delete()
                .eq('id', id);
            return { error };
        },

        async getStats() {
            const { data, error } = await supabase
                .from('consultas')
                .select('leido, respondida');

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
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .order('created_at', { ascending: false });
            return { data, error };
        },

        async getById(id) {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', id)
                .single();
            return { data, error };
        },

        async update(id, updates) {
            const { data, error } = await supabase
                .from('usuarios')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            return { data, error };
        },

        async updateRole(id, rol) {
            return this.update(id, { rol });
        },

        async toggleActive(id, activo) {
            return this.update(id, { activo });
        },

        async delete(id) {
            const { error } = await supabase
                .from('usuarios')
                .delete()
                .eq('id', id);
            return { error };
        }
    },

    storage: {

        async uploadImage(bucket, path, file) {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                return { error };
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);

            return { publicUrl, error: null };
        },

        async deleteImage(bucket, path) {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);
            return { error };
        }
    }
};

export default API;
