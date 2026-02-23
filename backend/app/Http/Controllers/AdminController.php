<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AiSetting;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'system_instruction' => 'nullable|string|max:5000',
            'model_name' => 'required|string|max:100',
            'temperature' => 'required|numeric|min:0|max:2',  
            'max_tokens' => 'required|integer|min:1|max:8192',
        ]);

        $setting = AiSetting::updateOrCreate(
            ['id' => 1],
            $validated
        );

        return response()->json([
            'message' => 'AI Persona berhasil diperbarui',
            'data' => $setting
        ], 200);
    }

    public function getSettings()
    {
        $setting = AiSetting::first();

        if (!$setting) {
            return response()->json([
                'system_instruction' => '',
                'model_name' => 'gemini-2.5-flash',
                'temperature' => 0.7,
                'max_tokens' => 2048
            ], 200);
        }

        return response()->json($setting, 200);
    }
}
