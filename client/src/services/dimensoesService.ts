import api from './api';

export async function getCalendario() {
  const res = await api.get('/dimensoes/calendario');
  return res.data; // array de objetos do dim_calendario
}

export async function getLocalidade() {
  const res = await api.get('/dimensoes/localidade');
  return res.data; // array de objetos do dim_localidade
}

export async function getTipoAcidente() {
  const res = await api.get('/dimensoes/tipoAcidente');
  return res.data; // array de objetos do dim_tipo_acidente
}

export async function getCrime() {
  const res = await api.get('/dimensoes/crime');
  return res.data; // array de objetos do dim_tipo_acidente
}
