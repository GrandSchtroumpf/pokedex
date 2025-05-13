let fetchPokemons;
onmessage = async ({ data }) => {
  if (data.type === 'init') {
    const { urls } = data;
    const fetchAll = urls.map((url) => fetch(url, { priority: 'low' }).then(res => res.json()));
    fetchPokemons = Promise.all(fetchAll).then((all) => all.flat());
  } else if (data.type === 'search') {
    const { input, types } = data;
    const pokemons = await fetchPokemons;
    const source = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const result = pokemons
      .filter((p) => {
        const pokemonTypes = p.types.map(v => v.id);
        if (types.length && types.some(((t) => !pokemonTypes.includes(t)))) return false;
        return p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(source)
      })
      .sort((a, b) => Number(b.name.toLowerCase().startsWith(input)) - Number(a.name.toLowerCase().startsWith(input)));
    postMessage(result);
  }
};