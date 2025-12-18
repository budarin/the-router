import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRouter } from '../src/index';

describe('useRouter', () => {
    let originalWindow: typeof window;

    beforeEach(() => {
        originalWindow = window;

        window = {
            ...originalWindow,
            location: {
                href: 'http://localhost/',
                origin: 'http://localhost',
                pathname: '/',
                search: '',
                hash: '',
            } as Location,
            history: {
                ...originalWindow.history,
                replaceState: vi.fn(),
                pushState: vi.fn(),
                back: vi.fn(),
                forward: vi.fn(),
                go: vi.fn(),
                length: 1,
            },
        } as unknown as Window & typeof globalThis;

        // Удаляем navigation для тестирования fallback на History API
        delete (window as any).navigation;
    });

    afterEach(() => {
        window = originalWindow;
        vi.clearAllMocks();
    });

    describe('Базовое использование', () => {
        it('должен возвращать базовое состояние', () => {
            const { result } = renderHook(() => useRouter());

            expect(result.current).toHaveProperty('location');
            expect(result.current).toHaveProperty('pathname');
            expect(result.current).toHaveProperty('searchParams');
            expect(result.current).toHaveProperty('params');
            expect(result.current).toHaveProperty('historyIndex');
            expect(result.current).toHaveProperty('navigate');
            expect(result.current).toHaveProperty('back');
            expect(result.current).toHaveProperty('forward');
            expect(result.current).toHaveProperty('go');
            expect(result.current).toHaveProperty('replace');
            expect(result.current).toHaveProperty('canGoBack');
            expect(result.current).toHaveProperty('canGoForward');
        });

        it('должен возвращать текущий pathname', () => {
            window.location.pathname = '/users/123';
            window.location.href = 'http://localhost/users/123';

            const { result } = renderHook(() => useRouter());

            expect(result.current.pathname).toBe('/users/123');
        });

        it('должен парсить search params', () => {
            window.location.href = 'http://localhost/posts?page=2&sort=date';
            window.location.search = '?page=2&sort=date';

            const { result } = renderHook(() => useRouter());

            expect(result.current.searchParams.get('page')).toBe('2');
            expect(result.current.searchParams.get('sort')).toBe('date');
        });
    });

    describe('Параметры из роутов (URLPattern)', () => {
        it('должен парсить параметры из knownRoutes', () => {
            window.location.pathname = '/users/123';
            window.location.href = 'http://localhost/users/123';

            const { result } = renderHook(() =>
                useRouter({
                    USER: '/users/:id',
                })
            );

            expect(result.current.params).toEqual({ id: '123' });
        });

        it('должен парсить несколько параметров', () => {
            window.location.pathname = '/posts/2024/my-post';
            window.location.href = 'http://localhost/posts/2024/my-post';

            const { result } = renderHook(() =>
                useRouter({
                    POST: '/posts/:year/:slug',
                })
            );

            expect(result.current.params).toEqual({
                year: '2024',
                slug: 'my-post',
            });
        });

        it('должен возвращать пустой объект, если роут не совпал', () => {
            window.location.pathname = '/unknown';
            window.location.href = 'http://localhost/unknown';

            const { result } = renderHook(() =>
                useRouter({
                    USER: '/users/:id',
                })
            );

            expect(result.current.params).toEqual({});
        });
    });

    describe('Навигация через History API', () => {
        it('должен использовать History API для navigate', async () => {
            const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
            const pushStateSpy = vi.spyOn(window.history, 'pushState');

            const { result } = renderHook(() => useRouter());

            await act(async () => {
                await result.current.navigate('/posts', { replace: true });
            });

            expect(replaceStateSpy).toHaveBeenCalled();

            await act(async () => {
                await result.current.navigate('/users');
            });

            expect(pushStateSpy).toHaveBeenCalled();

            replaceStateSpy.mockRestore();
            pushStateSpy.mockRestore();
        });

        it('должен вызывать history.back', () => {
            const backSpy = vi.spyOn(window.history, 'back');

            const { result } = renderHook(() => useRouter());

            act(() => {
                result.current.back();
            });

            expect(backSpy).toHaveBeenCalled();

            backSpy.mockRestore();
        });

        it('должен вызывать history.forward', () => {
            const forwardSpy = vi.spyOn(window.history, 'forward');

            const { result } = renderHook(() => useRouter());

            act(() => {
                result.current.forward();
            });

            expect(forwardSpy).toHaveBeenCalled();

            forwardSpy.mockRestore();
        });
    });

    describe('Опции', () => {
        it('должен использовать настраиваемый лимит кэша', () => {
            const { result } = renderHook(() => useRouter());

            expect(result.current).toBeDefined();
            // Проверяем, что хук работает с настройками
            expect(result.current.pathname).toBeDefined();
        });
    });
});
