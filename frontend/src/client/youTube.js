const placeholderFunc = (arg1, arg2) => (
  new Promise((resolve, reject) => {
    const request = 'url';
    fetch(request, { method: 'GET' })
      .then(res => res.json())
      .then(res => resolve(res))
      .catch(e => reject(e));
  })
);


export default {
  placeholderFunc
};
