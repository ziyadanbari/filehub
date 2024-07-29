<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Files extends Model
{
    use HasFactory, HasUuids;
    protected $fillable = ["password"];
    protected $hidden = ["password"];
    protected $table = 'files';
    public function files()
    {
        return $this->hasMany(File::class, 'files_group_id');
    }

    protected static function booted()
    {
        static::creating(function ($files) {
            if ($files->password)
                $files->password = Hash::make($files->password);
        });

        static::updating(function ($files) {
            if ($files->isDirty('password')) {
                $files->password = Hash::make($files->password);
            }
        });
    }
}
