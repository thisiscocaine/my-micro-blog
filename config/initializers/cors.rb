Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("FRONTEND_ORIGINS", "").split(",")
    resource "/graphql", headers: :any, methods: [:post, :options], credentials: true
  end
end