<?php

namespace App\Http\Controllers;

use App\Models\Files;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class DownloadFiles extends Controller
{
    public  function downloadFiles(Request $request, $id)
    {
        try {
            $request->merge([
                "id" => $id
            ]);
            $request->validate([
                "id" => "uuid|string|required|exists:files,id",
                "password" => "nullable|string"
            ]);
            $files = Files::find($request->id)->load('files');
            if (!$files) throw new Exception("Files not found", 404);
            if ($files->password && !($request->password || Hash::check($request->password, $files->password))) throw new Exception("Password needed", 403);
            if (count($files->files) > 1) {
                $zipFileName = storage_path('app/tmp/' . uniqid() . '.zip');
                $zip = new ZipArchive();

                if ($zip->open($zipFileName, ZipArchive::CREATE) !== TRUE) {
                    throw new Exception("Could not create zip file", 500);
                }
                foreach ($files->files as $file) {
                    $fileContent = Storage::get($file->file_path);
                    $zip->addFromString(basename($file->file_path), $fileContent);
                }
                $zip->close();
                return response()->download($zipFileName)->deleteFileAfterSend(true);
            }
            return response()->download(storage_path('app/' . $files->files[0]->file_path));
        } catch (Exception $error) {
            return response()->json(["error" => $error->getMessage()], 500);
        }
    }
}
