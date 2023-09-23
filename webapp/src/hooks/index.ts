import {useDispatch, useSelector} from 'react-redux';
// eslint-disable-next-line no-duplicate-imports
import type {TypedUseSelectorHook} from 'react-redux';

import {AppDispatch, RootState} from '@/reducers';
// 그냥 useDispatch와 useSelector를 쓰지말고 이걸 불러서 사용하자.
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
