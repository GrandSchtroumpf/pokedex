let fetchPokemons;
onmessage = async ({ data }) => {
  if (data.type === 'init') {
    const { urls } = data;
    const fetchAll = urls.map((url) => fetch(url, { priority: 'low' }).then(res => res.json()));
    fetchPokemons = Promise.all(fetchAll).then((all) => all.flat());
  } else if (data.type === 'search') {
    const { input } = data;
    const pokemons = await fetchPokemons;
    const result = pokemons
      .filter((p) => p.name.toLowerCase().includes(input))
      .sort((a, b) => Number(b.name.toLowerCase().startsWith(input)) - Number(a.name.toLowerCase().startsWith(input)));
    postMessage(result);
  }
};