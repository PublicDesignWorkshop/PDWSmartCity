Rails.application.routes.draw do
  resources :snapshots do
    collection do
      get 'search/:location_id' => 'snapshots#search'
    end
  end
  resources :measures do
    collection do
      get 'search/:location_id/:timestamp/:interval' => 'measures#search'
      post 'upload/:location_id' => 'measures#upload'
    end
  end
  resources :locations
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
