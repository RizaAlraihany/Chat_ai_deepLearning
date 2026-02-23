<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\GeminiService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    // Ambil semua conversation user
    public function index(Request $request)
    {
        return $request->user()
            ->conversations()
            ->with('messages')
            ->latest()
            ->get();
    }

    // Kirim pesan dan dapatkan response AI
    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'conversation_id' => 'nullable|exists:conversations,id'
        ]);

        $user = $request->user();

        // 1. Handle Conversation (New or Existing)
        if ($request->conversation_id) {
            $conversation = Conversation::findOrFail($request->conversation_id);
        } else {
            $conversation = Conversation::create([
                'user_id' => $user->id,
                'title' => mb_substr($request->message, 0, 50) . '...'
            ]);
        }

        // 2. Simpan pesan user
        Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $request->message
        ]);

        // 3. Ambil history (max 10 pesan terakhir)
        $history = $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->take(10)
            ->get();

        // 4. Panggil Gemini API
        $aiResponseData = $this->gemini->generateContent($history);

        // 5. Extract AI response
        $aiText = $aiResponseData['candidates'][0]['content']['parts'][0]['text']
            ?? 'Maaf, terjadi kesalahan pada AI.';

        // 6. Simpan response AI
        Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'model',
            'content' => $aiText
        ]);

        return response()->json([
            'conversation_id' => $conversation->id,
            'user_message' => $request->message,
            'ai_response' => $aiText
        ], 200);
    }
}
