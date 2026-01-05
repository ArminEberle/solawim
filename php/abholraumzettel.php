<?php
// Return default HTML when this file is accessed directly
if (php_sapi_name() !== 'cli') {
    echo '<!DOCTYPE html><html>
    <head>
        <title>Abholraum Zettel</title>
        <link rel="stylesheet" href="solawim_abholraumzettel/solawim_abholraumzettel.css">
        <script src="solawim_abholraumzettel/solawim_abholraumzettel.js"></script>
    </head>
    <body><div id="solawim_abholraumzettel"></div></body>
</html>';
    exit;
}
