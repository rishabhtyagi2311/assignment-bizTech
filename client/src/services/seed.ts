import api from './api';

export const checkAndSeedSystem = async () => {
  const response = await api.get('/seed/check');
  return response.data;
};



export const refreshDatabase = async (): Promise<{ message: string }> => {
  const response = await api.post('/seed/refresh');
  return response.data;
};


export const getSeedTemplate = async () => {
  const response = await api.get('/seed/template');
  return response.data;
};

export const postCustomSeed = async (payload: any) => {
  const response = await api.post('/seed/custom', payload);
  return response.data;
};