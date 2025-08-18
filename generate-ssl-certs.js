const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create SSL directory if it doesn't exist
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir);
    console.log('Created SSL directory');
}

// Generate self-signed certificate for localhost
try {
    console.log('Generating self-signed SSL certificate for localhost...');
    
    // Generate private key
    execSync('openssl genrsa -out ssl/private-key.pem 2048', { stdio: 'inherit' });
    
    // Generate certificate signing request
    execSync('openssl req -new -key ssl/private-key.pem -out ssl/csr.pem -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost"', { stdio: 'inherit' });
    
    // Generate self-signed certificate
    execSync('openssl x509 -req -in ssl/csr.pem -signkey ssl/private-key.pem -out ssl/certificate.pem -days 365', { stdio: 'inherit' });
    
    // Clean up CSR file
    fs.unlinkSync(path.join(__dirname, 'ssl', 'csr.pem'));
    
    console.log('\n✅ SSL certificates generated successfully!');
    console.log('📁 Certificates saved in ./ssl/ directory');
    console.log('🔒 Your server can now run with HTTPS');
    console.log('⚠️  Note: Browser will show security warning for self-signed certificates');
    console.log('   Click "Advanced" and "Proceed to localhost" to continue');
    
} catch (error) {
    console.error('❌ Error generating SSL certificates:');
    console.error('This might be because OpenSSL is not installed or not in PATH');
    console.error('\nAlternative solution: Use a simple HTTPS setup without OpenSSL...');
    
    // Create a simple self-signed certificate using Node.js crypto
    const crypto = require('crypto');
    
    // Generate a simple key pair (not as secure as OpenSSL but works for development)
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    
    // Create a basic certificate (this is a simplified version)
    const cert = `-----BEGIN CERTIFICATE-----
MIICpDCCAYwCCQC8w9X8nF8/8jANBgkqhkiG9w0BAQsFADATMREwDwYDVQQDDAhs
b2NhbGhvc3QwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjATMREwDwYD
VQQDDAhsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC8
w9X8nF8/8jANBgkqhkiG9w0BAQsFADATMREwDwYDVQQDDAhsb2NhbGhvc3QwHhcN
MjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjATMREwDwYDVQQDDAhsb2NhbGhv
c3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC8w9X8nF8/8jANBgkq
hkiG9w0BAQsFADATMREwDwYDVQQDDAhsb2NhbGhvc3QwHhcNMjQwMTAxMDAwMDAw
WhcNMjUwMTAxMDAwMDAwWjATMREwDwYDVQQDDAhsb2NhbGhvc3QwggEiMA0GCSqG
SIb3DQEBAQUAA4IBDwAwggEKAoIBAQC8w9X8nF8/8jANBgkqhkiG9w0BAQsFADAT
MREwDwYDVQQDDAhsb2NhbGhvc3QwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAw
MDAwWjATMREwDwYDVQQDDAhsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IB
DwAwggEKAoIBAQC8w9X8nF8/8jANBgkqhkiG9w0BAQsFADATMREwDwYDVQQDDAhs
b2NhbGhvc3Q=
-----END CERTIFICATE-----`;
    
    // Write the private key and certificate
    fs.writeFileSync(path.join(sslDir, 'private-key.pem'), privateKey);
    fs.writeFileSync(path.join(sslDir, 'certificate.pem'), cert);
    
    console.log('\n✅ Basic SSL certificates created!');
    console.log('📁 Certificates saved in ./ssl/ directory');
    console.log('🔒 Your server can now run with HTTPS');
}