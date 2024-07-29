<?php

namespace App\Http\Controllers;

use App\Models\Files;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SecurityChecker extends Controller
{
    public function passwordCheck(Request $request, $id)
    {
        $password = $request->input('password');
        $files = Files::find($id);
        if (!$files) {
            return response()->json(['error' => 'File not found'], 404);
        }

        if ($files->password && !Hash::check($password, $files->password)) {
            return response()->json(['error' => 'Password is incorrect'], 403);
        }
        return response()->json(["message" => "ok"]);
    }
}
