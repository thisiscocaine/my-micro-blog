def valid_signature?(payload, signature, secret)
  expected = OpenSSL::HMAC.hexdigest("SHA256", secret, payload)
  ActiveSupport::SecurityUtils.secure_compare(expected, signature.to_s)
end