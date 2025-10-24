<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'light') == 'dark'])>
    <head>
        
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        {{-- Desactivar advertencias de lazy loading --}}
        <meta http-equiv="origin-trial" content="AlpPPj7z2ySoFxPtuTlEp77ypX1P1Sx3Tg7G9CL/+ESzEQJUxCnG5st0QUh41jUNVPxwKUF+0LXyA5T+UhkuDgsAAABfeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjgwMDAiLCJmZWF0dXJlIjoiTGF6eUltYWdlTWluaW1hbEluaXRpYWxJbWFnZVJlcXVlc3RzIiwiZXhwaXJ5IjoxNzE5MzU5OTk5fQ==">

        {{-- Inline script to apply theme immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "light" }}';

                if (appearance === 'dark') {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Sibimar') }}</title>

        {{-- 🔹 LOGO / FAVICON --}}
        <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16x16.png') }}">
        <link rel="manifest" href="{{ asset('site.webmanifest') }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
