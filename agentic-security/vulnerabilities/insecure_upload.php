
<?php
// EXAMPLE: DO NOT USE IN PRODUCTION
// This is a demonstration file showing what NOT to do

// High: Insecure File Upload
function processUpload() {
    $targetDir = "uploads/";
    $targetFile = $targetDir . basename($_FILES["fileToUpload"]["name"]);
    
    // Vulnerable: No validation of file types
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $targetFile)) {
        echo "The file ". htmlspecialchars(basename($_FILES["fileToUpload"]["name"])). " has been uploaded.";
    } else {
        echo "Sorry, there was an error uploading your file.";
    }
}

// The correct way would check file types, use secure random names, etc.

// Low: Debug information leak
function handleError($error) {
    echo "Error details: " . $error->getMessage();
    echo "Stack trace: " . $error->getTraceAsString();
}
?>
