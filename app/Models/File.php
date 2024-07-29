<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;
    protected $table = 'file';
    protected $guarded = [];
    public function fileGroup()
    {
        return $this->belongsTo(Files::class, 'files_group_id');
    }
}
