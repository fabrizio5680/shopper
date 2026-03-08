import { atom } from 'jotai';
import { MOCK_RECIPE_SEARCHES } from '../data/mock';
import type { RecipeSearch } from '../types';

export const searchesAtom = atom<RecipeSearch[]>(MOCK_RECIPE_SEARCHES);
