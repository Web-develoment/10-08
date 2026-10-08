import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const getItemName = (item) => item?.nome ?? item?.name ?? 'Sem nome';
const getItemDescription = (item) => item?.descricao ?? item?.description ?? 'Sem descrição';

const App = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getItems();
  }, []);

  async function getItems() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem(event) {
    event.preventDefault();

    if (!newItemName.trim() || !newItemDescription.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payloads = [
        { nome: newItemName, descricao: newItemDescription },
        { name: newItemName, description: newItemDescription },
      ];

      let lastError = null;

      for (const payload of payloads) {
        const { error } = await supabase.from('produtos').insert([payload]);

        if (!error) {
          setNewItemName('');
          setNewItemDescription('');
          await getItems();
          return;
        }

        lastError = error;
      }

      throw lastError;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-400">Carregando itens...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-red-500">Ocorreu um erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-900">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-2">Gerenciador de Itens</h1>
        <p className="text-gray-400">Adicione e visualize itens com React e Supabase</p>
      </header>

      <form onSubmit={handleAddItem} className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
            Nome do Item
          </label>
          <input
            id="name"
            type="text"
            placeholder="Ex: Tênis de corrida"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            disabled={isSubmitting}
            className="shadow appearance-none border-0 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">
            Descrição
          </label>
          <textarea
            id="description"
            placeholder="Ex: Confortável e leve para longas distâncias."
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            disabled={isSubmitting}
            className="shadow appearance-none border-0 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Adicionando...' : 'Adicionar Item'}
          </button>
        </div>
      </form>

      <div className="mt-10 w-full max-w-md">
        {items.length > 0 ? (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="bg-gray-800 p-6 rounded-xl shadow-md transition-transform transform hover:scale-105 duration-300">
                <h2 className="text-xl font-semibold text-white">{getItemName(item)}</h2>
                <p className="mt-2 text-gray-400">{getItemDescription(item)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center">Nenhum item encontrado. Adicione um novo!</p>
        )}
      </div>
    </div>
  );
};

export default App;
