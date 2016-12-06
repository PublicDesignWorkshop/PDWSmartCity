class Snapshot
  include Mongoid::Document
  include Mongoid::Timestamps::Created
  include Mongoid::Timestamps::Updated
  
  field :location_id, type: String
  field :timestamp, type: Integer
  field :timeinterval, type: Integer
  field :sensors, type: Array
  field :comments, type: Array
  field :questions, type: Array
  field :answers, type: Array
end
