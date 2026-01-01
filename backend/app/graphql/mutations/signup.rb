require "securerandom"
require "openssl"

class Mutations::Signup < Mutations::BaseMutation
  argument :first_name, String, required: true
  argument :last_name, String, required: true
  argument :email, String, required: true
  argument :password, String, required: true

  field :token, String, null: true
  field :user, Types::UserType, null: false

  def resolve(first_name:, last_name:, email:, password:)
    user = User.create!(
      first_name: first_name,
      last_name: last_name,
      email: email.downcase.strip,
      password: password,
      tenant_id: SecureRandom.uuid,
      role: "user",
      email_verified: false
    )

    raw_token = SecureRandom.hex(32)
    token_hash = OpenSSL::Digest::SHA256.hexdigest(raw_token)
    user.update!(
      email_verify_token_hash: token_hash,
      email_verify_expires_at: 24.hours.from_now
    )

    verify_url = "#{ENV.fetch("FRONTEND_BASE_URL")}/verify-email?token=#{raw_token}"
    Mailer.verify_email(user.email, verify_url).deliver_later

    jwt = JwtIssuer.issue(sub: user.id, aud: "app", exp: 30.minutes.from_now.to_i)
    { token: jwt, user: user }
  end
end