<?php

use App\Http\Controllers\DownloadFiles;
use App\Http\Controllers\SecurityChecker;
use App\Http\Controllers\UploadFiles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/uploadfiles', [UploadFiles::class, 'uploadFiles']);
Route::get('/downloadfiles/{id}', [DownloadFiles::class, 'downloadFiles']);
Route::post('/securitycheck/{id}', [SecurityChecker::class, 'passwordCheck']);
