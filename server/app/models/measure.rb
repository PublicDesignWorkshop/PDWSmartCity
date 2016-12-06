class Measure
  include Mongoid::Document
  include Mongoid::Timestamps::Created
  include Mongoid::Timestamps::Updated

  field :type, type: String
  field :model, type: String
  field :value, type: Float
  field :unit, type: String
  field :timestamp, type: Integer
  field :latitude, type: Float
  field :longitude, type: Float
  field :location_id, type: String
end
