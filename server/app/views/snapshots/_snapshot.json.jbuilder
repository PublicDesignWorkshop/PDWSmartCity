json.extract! snapshot, :id, :location_id, :timestamp, :timeinterval, :sensors, :comments, :questions, :answers, :created_at, :updated_at
json.url snapshot_url(snapshot, format: :json)