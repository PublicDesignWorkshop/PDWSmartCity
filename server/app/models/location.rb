class Location
  include Mongoid::Document
  include Mongoid::Timestamps::Created
  include Mongoid::Timestamps::Updated

  field :name, type: String
  field :latitude, type: Float
  field :longitude, type: Float
  field :address, type: String
  field :inside, type: Boolean
end
