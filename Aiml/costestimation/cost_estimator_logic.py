import pandas as pd

class CostEstimatorAI:
    def __init__(self, dataset_path):
        """
        Initializes the Cost Estimator AI using the cleaned dataset.
        """
        self.df = pd.read_csv(dataset_path)
        # Convert venue names to lowercase for easier matching
        self.df['name_lower'] = self.df['name'].str.lower()
        
    def estimate_cost(self, venue_name, guests, needs_decoration=False, needs_makeup=False, needs_dj=False, needs_photography=False):
        """
        Rule-Based AI Logic for Estimating Event Cost.
        
        Rules used:
        - Base Cost = Cost per plate * number of guests
        - Total Extra Services = specific service costs fetched from dataset (based on venue context)
        - Final Estimation = Base Cost + Total Extra Services
        """
        # Find venue in the dataset
        venue_data = self.df[self.df['name_lower'].str.contains(venue_name.lower(), na=False)]
        
        if venue_data.empty:
            return {"error": f"Venue matching '{venue_name}' not found in the dataset."}
            
        # If multiple matches, take the first one
        venue = venue_data.iloc[0]
        
        # 1. Base Cost (Cost per plate * guests)
        cost_per_plate = venue['cost_per_plate']
        base_cost = cost_per_plate * guests
        
        # 2. Extra Services Cost mapping
        extra_services_cost = 0
        breakdown = {
            "venue_name": venue['name'],
            "base_cost": base_cost,
            "cost_per_plate": cost_per_plate,
            "guests": guests,
            "extras": {}
        }
        
        # Rule: Add decoration cost
        if needs_decoration:
            dec_cost = venue['decoration']
            extra_services_cost += dec_cost
            breakdown['extras']['decoration'] = dec_cost
            
        # Rule: Add makeup artist cost
        if needs_makeup:
            makeup_cost = venue['makeup_artist']
            extra_services_cost += makeup_cost
            breakdown['extras']['makeup_artist'] = makeup_cost
            
        # Rule: Add DJ cost
        if needs_dj:
            dj_cost = venue['dj']
            extra_services_cost += dj_cost
            breakdown['extras']['dj'] = dj_cost
            
        # Rule: Add photography cost
        if needs_photography:
            photo_cost = venue['photography']
            extra_services_cost += photo_cost
            breakdown['extras']['photography'] = photo_cost
            
        # 3. Final Total Cost Validation & calculation
        total_estimated_cost = base_cost + extra_services_cost
        breakdown['total_estimated_cost'] = total_estimated_cost
        
        return breakdown

# Example usage when the script is run directly
if __name__ == "__main__":
    estimator = CostEstimatorAI('CostEstimation_Dataset.csv')
    
    # Example estimation query
    print("Running AI Logic Custom Scenario...")
    result = estimator.estimate_cost(
        venue_name="Woodapple Residency", 
        guests=500, 
        needs_decoration=True, 
        needs_makeup=True, 
        needs_dj=True, 
        needs_photography=True
    )
    
    if "error" in result:
        print(result["error"])
    else:
        print("\n--- Cost Estimation Summary ---")
        print(f"Venue: {result['venue_name']}")
        print(f"Guests: {result['guests']} @ Rs.{result['cost_per_plate']}/plate")
        print(f"Food Base Cost: Rs. {result['base_cost']}")
        print("Required Extras:")
        for extra, cost in result['extras'].items():
            print(f"  - {extra.replace('_', ' ').title()}: Rs. {cost}")
        print(f"Total Estimated Cost: Rs. {result['total_estimated_cost']}")
        print("-------------------------------\n")
