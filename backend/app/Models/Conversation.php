<?php

namespace App\Models;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title'
    ];

  
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Messages
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
