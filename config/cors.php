<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [
        'https://evergreenrealtyph.com',
        'https://api.evergreenrealtyph.com',
        'http://localhost:5173',
        'http://localhost:8000'
    ], 
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    'exposed_headers' => [],
    'max_age' => 600,
    'supports_credentials' => true,
];

