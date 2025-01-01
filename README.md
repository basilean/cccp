# Cannabis Computer Club Planner
What if all of us could easily drop our experience in one place and then use it to plan a new season?  
This community driven engine creates a calendar to daily follow and cross on the fridge's door.

## How it Works?
* Read community driven database.
* Set solstice date as central point to calculate everything else.
> It changes from south to north of equator line.
> It announces vegetative transition to flowering.
> Indoor it would be when lights change to 12/12.
* Add one or more pots.
  * Select a seed.
  * Best stages times.
  * Adjust transition if needed.
  * Select a profile.
  * Start time can be adjusted for auto (vegetative == 0).
* Apply to calculate an optimal schedule.

## Knowledge Base
This is the data that feeds CCCP ui and engine to help you create best plan.  
It lives here! in this GitHub repository as *toml* files inside *db* directory. The idea behind is to make it easy for the community to participate.

### Seeds
Each strain with their properties and recommendations.
* A unique name.
* best, min and max days values for:
  * germination: When hydrating the seed in water and/or put it in a jiffy.
  * seedling: Soiling seed ideally in a small pot.
  * vegetative: Growing stage of 18 hours of sun.
  * transition: Time it takes from solstice to show first flowers.
  * flowering: How long before harvest.

### Profiles
Build your custom profile from shared actions.
* A profile is divided in plant's growing stages.
> Germination, Seedling, Vegetative, Transition, Flowering.
* Each stage is divided in its belonged days.
> Germination 1 to 7, Seedling 1 to 14, etc.
* In a day, one or more actions could be started.
* An action could have recurrence with end time.
> Flowering starts on day 2, repeats each 14 days and end -7 days (minus from end).
> (yeah, at least that complex, some products asks for that.)

### Actions
Each action to perform over plant's lifecycle, from washing last week, to recurrent apply some product on a particular stage.
