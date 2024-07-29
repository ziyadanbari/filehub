<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Files;

class UploadFiles extends Controller
{

    public function uploadFiles(Request $request)
    {
        $request->validate([
            "file" => "array|min:1",
            "file.*" => "file|max:1048576",
            "password" => "nullable|string"
        ]);
        $file_storage = Files::create([
            "password" => $request->password
        ]);
        foreach ($request->file as $file) {
            $originalName = $file->getClientOriginalName();
            $path = 'uploads/' . time() . '_' . $originalName;
            $uploaded = Storage::put($path, file_get_contents($file), 'public');
            if (!$uploaded) return response()->json(["error" => "Cannot upload $originalName"]);

            $file = new File([
                "file_path" => $path
            ]);
            $file_storage->files()->save($file);
        }
        $file_storage->save();
        $file_storage->load('files');
        $link = env("CLIENT_APP_URL", "http://localhost:3000") . "/$file_storage->id";
        return response()->json(["link" => $link]);
    }
}
