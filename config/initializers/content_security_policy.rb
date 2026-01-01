Rails.application.config.content_security_policy do |policy|
  policy.default_src :self
  policy.script_src  :self
  policy.style_src   :self
  policy.img_src     :self, :data
  policy.frame_ancestors :none
end