import { component$, createContextId, noSerialize, useComputed$, useContext, useContextProvider, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";

const ContextList = createContextId<ListState<any, any>>('ContextList');
interface ListState<T, Search extends Record<string, any>> {
  list: T[];
  searchParams: Search;
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc'
}

export function useListProvider<T, Search extends Record<string, any>>(initialState: Partial<ListState<T, Search>>) {
  const state = useStore({
    list: [],
    searchParams: {},
    limit: Infinity,
    offset: 0,
    sortBy: undefined,
    sortOrder: 'asc' as const,
    ...initialState
  });

  useContextProvider(ContextList, state);
  return state;
}

export function useComputedList<T, Search extends Record<string, any>>(
  state: ListState<T, Search>,
  filterFn?: (item: T, searchParams: Search) => boolean,
  sortFn?: (a: T, b: T, sortBy: string) => number
) {
  const _filterFn = noSerialize(filterFn);
  const _sortFn = noSerialize(sortFn);
  return useComputed$(async () => {
    const dir = state.sortOrder === 'asc' ? 1 : -1;
    const filtered = _filterFn
      ? state.list.filter(item => _filterFn(item, state.searchParams))
      : state.list;
    const sorted = (state.sortBy && _sortFn)
      ? filtered.sort((a, b) => dir * _sortFn(a, b, state.sortBy!))
      : dir === 1 ? filtered : filtered.reverse();
    return sorted.slice(state.offset, state.limit)
  })
}

interface LoadMoreProps {
  limit: number
}
export const LoadMore = component$((props: LoadMoreProps) => {
  const ref = useSignal<HTMLElement>();
  const state = useContext(ContextList);
  useVisibleTask$(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      state.limit += props.limit;
      if (state.limit + state.offset >= state.list.length) observer.disconnect();
    }, {
      rootMargin: '300px 0px'
    });
    observer.observe(ref.value!);
    return () => observer.disconnect();
  }, { strategy: 'intersection-observer' });
  return <div ref={ref}></div>
})