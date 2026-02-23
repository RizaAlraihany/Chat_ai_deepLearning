<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\AiSetting;

class GeminiService
{
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';

    public function __construct()
    {
        $this->apiKey = trim(env('GEMINI_API_KEY', ''));
    }

    /**
     * Generate content menggunakan Gemini AI
     * 
     * @param array|\Illuminate\Support\Collection $messages
     * @return array
     */
    public function generateContent($messages)
    {
        // 1. Validasi API Key
        if (empty($this->apiKey)) {
            Log::error('GEMINI_API_KEY is empty or not configured');
            return $this->errorResponse('API Key belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di file .env');
        }

        // 2. Ambil Setting dari DB atau Fallback ke .env
        try {
            $setting = AiSetting::first();
        } catch (\Exception $e) {
            Log::warning('Failed to fetch AiSetting from database: ' . $e->getMessage());
            $setting = null;
        }

        // Konfigurasi dengan prioritas: DB > .env > default
        $modelName = $this->getModelName($setting);
        $temperature = $setting && isset($setting->temperature)
            ? (float)$setting->temperature
            : (float)env('GEMINI_TEMPERATURE', 0.7);
        $maxTokens = $setting && isset($setting->max_tokens)
            ? (int)$setting->max_tokens
            : (int)env('GEMINI_MAX_TOKENS', 2048);
        $systemInstruction = $setting && !empty($setting->system_instruction)
            ? $setting->system_instruction
            : env('GEMINI_SYSTEM_INSTRUCTION', 'You are a helpful AI assistant.');

        // Validasi nilai konfigurasi
        $temperature = max(0, min(2, $temperature)); // Clamp antara 0-2
        $maxTokens = max(1, min(8192, $maxTokens)); // Clamp antara 1-8192

        // 3. Format Payload
        $contents = $this->formatMessages($messages);

        if (empty($contents)) {
            return $this->errorResponse('Tidak ada pesan untuk diproses');
        }

        // 4. Kirim Request ke Gemini API
        return $this->sendApiRequest($modelName, $contents, $systemInstruction, $temperature, $maxTokens);
    }

    /**
     * Get model name dari setting atau env
     */
    protected function getModelName($setting)
    {
        if ($setting && !empty($setting->model_name)) {
            return trim($setting->model_name);
        }

        $envModel = env('GEMINI_MODEL');
        if (!empty($envModel)) {
            return trim($envModel);
        }

        // Default model
        return 'gemini-3-flash-preview';
    }

    /**
     * Format messages untuk Gemini API
     */
    protected function formatMessages($messages)
    {
        $contents = [];

        foreach ($messages as $msg) {
            // Skip jika message kosong
            if (empty($msg->content)) {
                continue;
            }

            // Gemini hanya menerima 'user' atau 'model' sebagai role
            $role = ($msg->role === 'assistant' || $msg->role === 'model') ? 'model' : 'user';

            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $msg->content]]
            ];
        }

        return $contents;
    }

    /**
     * Kirim request ke Gemini API
     */
    protected function sendApiRequest($modelName, $contents, $systemInstruction, $temperature, $maxTokens)
    {
        try {
            Log::info("Requesting Gemini Model: {$modelName}", [
                'temperature' => $temperature,
                'maxTokens' => $maxTokens,
                'messageCount' => count($contents)
            ]);

            $url = $this->baseUrl . $modelName . ':generateContent?key=' . $this->apiKey;

            $response = Http::timeout(30)
                ->withOptions(['verify' => false])
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, [
                    'contents' => $contents,
                    'systemInstruction' => [
                        'parts' => [['text' => $systemInstruction]]
                    ],
                    'generationConfig' => [
                        'temperature' => $temperature,
                        'maxOutputTokens' => $maxTokens,
                    ]
                ]);

            // Handle error responses
            if ($response->failed()) {
                return $this->handleApiError($response, $modelName);
            }

            $responseData = $response->json();

            // Validasi response structure
            if (!isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                Log::error('Invalid response structure from Gemini API', ['response' => $responseData]);
                return $this->errorResponse('Format respons dari AI tidak valid');
            }

            return $responseData;
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Connection timeout to Gemini API: ' . $e->getMessage());
            return $this->errorResponse('Koneksi ke AI timeout. Silakan coba lagi.');
        } catch (\Exception $e) {
            Log::error('Exception in GeminiService: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return $this->errorResponse('Terjadi kesalahan internal server saat menghubungi AI.');
        }
    }

    /**
     * Handle API error responses
     */
    protected function handleApiError($response, $modelName)
    {
        $status = $response->status();
        $body = $response->body();

        Log::error("Gemini API Error ({$status})", [
            'model' => $modelName,
            'response' => $body
        ]);

        switch ($status) {
            case 400:
                $errorMsg = '400 Bad Request: Sintaks permintaan salah atau tidak dapat dipahami server.';
                break;
            case 401:
                $errorMsg = 'Membutuhkan otentikasi (login) untuk mengakses halaman.';
                break;
            case 403:
                $errorMsg = 'Server menolak permintaan, akses terlarang.';
                break;
            case 404:
                $errorMsg = "Model \"{$modelName}\" tidak ditemukan.";
                break;
            case 429:
                $errorMsg = 'Terlalu banyak request. Silakan coba lagi nanti.';
                break;
            case 500:
            case 503:
                $errorMsg = 'Server Gemini API sedang bermasalah. Silakan coba lagi.';
                break;
            default:
                $errorMsg = "Error dari Gemini API: {$status}";
        }

        return $this->errorResponse($errorMsg);
    }

    /**
     * Generate error response format
     */
    protected function errorResponse($message)
    {
        return [
            'candidates' => [[
                'content' => [
                    'parts' => [['text' => "❌ {$message}"]]
                ]
            ]]
        ];
    }
}
