<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Routes untuk web interface (jika ada)
| Untuk SPA (Single Page Application), hanya perlu route fallback
*/

// API info endpoint (untuk dokumentasi)
Route::get('/', function () {
    return response()->json([
        'message' => 'AI Chat Backend API',
        'version' => '1.0.0',
        'status' => 'running',
        'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
        'api_endpoints' => [
            'register' => 'POST /api/register',
            'login' => 'POST /api/login',
            'logout' => 'POST /api/logout (authenticated)',
            'chat' => 'POST /api/chat (authenticated)',
            'conversations' => 'GET /api/conversations (authenticated)',
            'admin_settings' => 'GET/POST /api/admin/settings (admin only)',
        ],
        'documentation' => 'Please refer to README.md for full API documentation'
    ]);
});

// SPA fallback route (jika menggunakan Vue/React di blade)
// Uncomment jika Anda render SPA dari Laravel
/*
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$'); // Exclude API routes
*/
