import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'
import type {
  ExtractIngredientsRequest,
  ExtractIngredientsResponse,
  SaveIngredientsRequest,
  SaveIngredientsResponse,
  SaveRecipeRequest,
  SaveRecipeResponse,
  RescanIngredientsRequest,
  RescanIngredientsResponse,
  DeleteRecipeSearchRequest,
  DeleteRecipeSearchResponse,
  SearchProductsRequest,
  SearchProductsResponse,
} from '@shopper/shared'

export const extractIngredients = httpsCallable<
  ExtractIngredientsRequest,
  ExtractIngredientsResponse
>(functions, 'extractIngredients')

export const saveIngredients = httpsCallable<
  SaveIngredientsRequest,
  SaveIngredientsResponse
>(functions, 'saveIngredients')

export const rescanIngredients = httpsCallable<
  RescanIngredientsRequest,
  RescanIngredientsResponse
>(functions, 'rescanIngredients')

export const deleteRecipeSearch = httpsCallable<
  DeleteRecipeSearchRequest,
  DeleteRecipeSearchResponse
>(functions, 'deleteRecipeSearch')

export const saveRecipe = httpsCallable<
  SaveRecipeRequest,
  SaveRecipeResponse
>(functions, 'saveRecipe')

export const searchProducts = httpsCallable<
  SearchProductsRequest,
  SearchProductsResponse
>(functions, 'searchProducts')
