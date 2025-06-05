<?php
// Telegram Bot Token and Chat ID
$botToken = "7820044312:AAHCkQkWgzveBoeoht1e1MvDVzx0dWKfnuQ";
$chatId = "6189803357";

// Function to send data to Telegram (server-side)
function sendToTelegram($message) {
    global $botToken, $chatId;
    $url = "https://api.telegram.org/bot" . $botToken . "/sendMessage?chat_id=" . $chatId . "&text=" . urlencode($message);
    $success = false;
    $errorMessage = "";

    // Try using curl if available
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Required for some free hosts
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Prevent hanging
        $response = curl_exec($ch);
        if ($response === false) {
            $errorMessage = "Curl error: " . curl_error($ch);
        } else {
            $jsonResponse = json_decode($response, true);
            if (isset($jsonResponse['ok']) && $jsonResponse['ok'] === true) {
                $success = true;
            } else {
                $errorMessage = "Telegram API error: " . (isset($jsonResponse['description']) ? $jsonResponse['description'] : 'Unknown error');
            }
        }
        curl_close($ch);
    } else {
        $errorMessage = "Curl not available on this server.";
    }

    // Fallback to file_get_contents if curl fails or is unavailable
    if (!$success && function_exists('file_get_contents')) {
        $context = stream_context_create(['http' => ['timeout' => 10]]);
        $response = @file_get_contents($url, false, $context);
        if ($response !== false) {
            $jsonResponse = json_decode($response, true);
            if (isset($jsonResponse['ok']) && $jsonResponse['ok'] === true) {
                $success = true;
            } else {
                $errorMessage = "Telegram API error (file_get_contents): " . (isset($jsonResponse['description']) ? $jsonResponse['description'] : 'Unknown error');
            }
        } else {
            $errorMessage = "file_get_contents failed to connect to Telegram API.";
        }
    }

    // If sending fails, log to a file as a fallback
    if (!$success) {
        $logMessage = "[Telegram Send Failed] " . date("Y-m-d H:i:s") . " - Error: " . $errorMessage . " - Original Message: " . $message . "\n";
        @file_put_contents('telegram_errors.txt', $logMessage, FILE_APPEND);
    }

    return ['success' => $success, 'error' => $errorMessage];
}

// Function to get user's IP address (simplified server-side detection)
function getUserIP() {
    // Check for IP in various headers (handles proxies and direct connections)
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

// Get the user's IP address (server-side)
$userIP = getUserIP();

// Get additional user information (optional)
$userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown';
$timestamp = date("Y-m-d H:i:s");

// Prepare the message to send to Telegram
$message = "New Visitor Detected\n";
$message .= "IP Address: " . $userIP . "\n";
$message .= "User Agent: " . $userAgent . "\n";
$message .= "Timestamp: " . $timestamp . "\n";

// Attempt to send the IP message to Telegram
$result = sendToTelegram($message);

// If sending the IP failed, attempt to send an error message to Telegram
if (!$result['success']) {
    $errorMessage = "Failed to Send IP to Telegram\n";
    $errorMessage .= "Reason: " . $result['error'] . "\n";
    $errorMessage .= "Timestamp: " . $timestamp . "\n";
    sendToTelegram($errorMessage);
    
    // Also log the IP to a file as a backup
    $logEntry = "[$timestamp] IP: $userIP | User Agent: $userAgent\n";
    @file_put_contents('ip_log.txt', $logEntry, FILE_APPEND);
}

// Output the HTML content
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>AntifiedNull - NULL-GOD</title>
    <link rel="icon" href="https://i.ibb.co/ZLgFZqz/null-god-icon.png" />
    <style>
        html, body {
            margin: 0; padding: 0; height: 100%;
            font-family: 'Courier New', Courier, monospace;
            background-color: #0d0d0d;
            color: #00ffcc;
            overflow: hidden;
        }
        #particles-js {
            position: absolute; width: 100%; height: 100%; z-index: 0;
        }
        .container {
            position: relative; z-index: 1; padding: 40px;
            max-width: 800px; margin: auto; text-align: left;
        }
        h1, h2, h3 {
            color: #00ffff;
            text-shadow: 0 0 10px #00ffff;
        }
        .highlight {
            color: #ff007f;
            font-weight: bold;
        }
        ul {
            list-style: square; padding-left: 20px;
        }
        .section {
            margin-bottom: 30px;
        }
        .links img {
            width: 30px; vertical-align: middle; margin-right: 8px;
        }
        .links a {
            display: inline-block;
            margin-right: 20px;
            color: #00ffff;
            text-decoration: none;
            font-weight: bold;
            transition: 0.3s;
        }
        .links a:hover {
            color: #ff007f;
            transform: scale(1.05);
        }
        footer {
            margin-top: 50px;
            font-size: 0.9em;
            text-align: center;
            color: #888;
        }
    </style>
</head>
<body>
<div id="particles-js"></div>

<div class="container">
    <h1>Hello 👋, I Am <span class="highlight">AntifiedNull</span></h1>
    <h2> ---  <strong>NULL-GOD</strong></h2>

    <div class="section">
        <h3>👤 About Me:</h3>
        <p><strong>Real Name:</strong> Prateek</p>
        <p><strong>Age:</strong> 17</p>
        <p><strong>Class:</strong> 12th PCM</p>
    </div>

    <div class="section">
        <h3>💻 Skills:</h3>
        <ul>
            <li>Carding</li>
            <li>Programming</li>
            <li>Hacking</li>
            <li>API Building</li>
            <li>Bot Building</li>
            <li>Binning</li>
            <li>Cracking</li>
            <li>OSINT</li>
        </ul>
    </div>

    <div class="section">
        <h3>🧠 Methods I Created:</h3>
        <ul>
            <li>CC to UPI</li>
            <li>CC to Crypto</li>
            <li>Netflix Carding</li>
            <li>Refund Manipulation</li>
            <li>How to Make CC Checker</li>
            <li>API Development</li>
        </ul>
    </div>

    <div class="section links">
        <h3>📡 Follow & Contact:</h3>
        <a href="https://youtube.com/@god_antifiednull_x" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" /> YouTube
        </a>
        <a href="https://t.me/ANTIFIEDNULLXGOD" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="Telegram" /> Telegram Channel
        </a>
        <a href="https://t.me/GOD_ANTIFIEDNULL_X" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/5977/5977590.png" alt="Contact" /> Contact Me
        </a>
    </div>

    <footer>
        <hr style="border-color: #333;" />
        <p>© 2025 AntifiedNull | NULL-GOD</p>
    </footer>
</div>

<!-- Particles.js Library -->
<script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
<script>
particlesJS("particles-js", {
  "particles": {
    "number": { "value": 90, "density": { "enable": true, "value_area": 900 } },
    "color": { "value": "#00ffff" },
    "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" } },
    "opacity": { "value": 0.5, "random": true },
    "size": { "value": 3, "random": true },
    "line_linked": { "enable": true, "distance": 120, "color": "#00ffff", "opacity": 0.4, "width": 1 },
    "move": { "enable": true, "speed": 2.5, "direction": "none", "random": false, "straight": false, "out_mode": "bounce" }
  },
  "interactivity": {
    "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" } },
    "modes": { "repulse": { "distance": 80 }, "push": { "particles_nb": 4 } }
  },
  "retina_detect": true
});
</script>
</body>
</html>
