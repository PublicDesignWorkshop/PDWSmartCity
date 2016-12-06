class MeasuresController < ApplicationController
  before_action :set_measure, only: [:show, :edit, :update, :destroy]
  before_action :search_measure, only: [:search]
  skip_before_filter :verify_authenticity_token, :only => [:upload]

  # GET /measures
  # GET /measures.json
  def index
    @measures = Measure.all
  end

  # GET /measures/1
  # GET /measures/1.json
  def show
  end

  # GET /measures/new
  def new
    @measure = Measure.new
  end

  # GET /measures/1/edit
  def edit
  end

  # POST /measures
  # POST /measures.json
  def create
    @measure = Measure.new(measure_params)

    respond_to do |format|
      if @measure.save
        format.html { redirect_to @measure, notice: 'Measure was successfully created.' }
        format.json { render :show, status: :created, location: @measure }
      else
        format.html { render :new }
        format.json { render json: @measure.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /measures/1
  # PATCH/PUT /measures/1.json
  def update
    respond_to do |format|
      if @measure.update(measure_params)
        format.html { redirect_to @measure, notice: 'Measure was successfully updated.' }
        format.json { render :show, status: :ok, location: @measure }
      else
        format.html { render :edit }
        format.json { render json: @measure.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /measures/1
  # DELETE /measures/1.json
  def destroy
    @measure.destroy
    respond_to do |format|
      format.html { redirect_to measures_url, notice: 'Measure was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def search
  end

  def upload
    data = params[:data]
    location = Location.where(id: params[:location_id]).first
    min = 0;
    max = 0;
    @datasize = 0;
    data.each { |datum|
      x = datum.to_s.split(' ')
      if (min == 0 && max == 0) then
        min = x[4].to_i
        max = x[4].to_i
      else
        if (min > x[4].to_i) then
          min = x[4].to_i
        end
        if (max < x[4].to_i) then
          max = x[4].to_i
        end
      end
      temp = Measure.where(location_id: params[:location_id], timestamp: x[4]).first
      if temp == nil
        measure = Measure.new(type: x[0], model: x[1], value: x[2], unit: x[3], timestamp: x[4], latitude: location.latitude, longitude: location.longitude, location_id: params[:location_id])
        measure.save
        @datasize = @datasize + 1
      else
        temp.update(type: x[0], model: x[1], value: x[2], unit: x[3], timestamp: x[4], latitude: location.latitude, longitude: location.longitude, location_id: params[:location_id])
        @datasize = @datasize + 1
      end
    }
    @timestamp = ((min + max) * 0.5).to_i
    @interval = ((max.to_i - @timestamp.to_i) * 1.25).to_i
    # @measures = Measure.where(location_id: params[:location_id])

    @snapshotsize = 0;
    snapshottimes = params[:snapshots]
    snapshottimes.each { |snapshottime|
      temp = Snapshot.where(location_id: params[:location_id], timestamp: snapshottime.to_i).first
      if temp == nil
        snapshot = Snapshot.new(location_id: params[:location_id], timestamp: snapshottime.to_i, timeinterval: 60, sensors: [], comments: [], questions: [], answers: [])
        snapshot.save
        @snapshotsize = @snapshotsize + 1
      else
        temp.update(location_id: params[:location_id], timestamp: snapshottime.to_i, timeinterval: 60, sensors: [], comments: [], questions: [], answers: [])
        @snapshotsize = @snapshotsize + 1
      end
    }
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_measure
      @measure = Measure.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def measure_params
      params.require(:measure).permit(:type, :model, :value, :unit, :timestamp, :latitude, :longitude, :location_id)
    end

    def search_measure
      @measures = Measure.order(timestamp: :asc).where(location_id: params[:location_id], timestamp: (params[:timestamp].to_i - params[:interval].to_i)..(params[:timestamp].to_i + params[:interval].to_i))
    end
end
