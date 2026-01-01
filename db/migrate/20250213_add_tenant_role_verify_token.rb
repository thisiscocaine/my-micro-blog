class AddTenantRoleVerifyToken < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :tenant_id, :uuid, null: false
    add_column :users, :role, :string, null: false, default: "user"
    add_column :users, :email_verify_token_hash, :string
    add_column :users, :email_verify_expires_at, :datetime
    add_column :users, :email_verified, :boolean, null: false, default: false

    add_index :users, [:tenant_id, :role]
    add_index :users, :email_verify_token_hash, unique: true
  end
end