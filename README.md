# stargate-kiva
### Stargate Hackathon
#### September 11, 2020

**Team:** Colonel Jack

**What problem does this app solve?**
There are many variables potential lenders consider before providing a microloan through Kiva. Use *stargate-kiva* to visualize which countries have an abundance or lack of funding. This option helps you see the loan differences and details of those loans so you can best choose how you want to help small business owners throughout the world.

**Why is this app so cool?**
Using a heat map, you can visualize changes in real time to see where Kiva loans are being requested and provided. 
You can actively engage with the loan process, which changes the lives of small business owners without access to traditional lending services.

**Members:**
* Jeff Banks
* Jamie Gillenwater
* Dan Jatnieks
* Gianluca Righetto

**Bugs Filed:**
* [SH-6](https://datastax.jira.com/browse/SH-6)
* [SH-8](https://datastax.jira.com/browse/SH-8)

## Install the app
1. Clone the *stargate-kiva* repo.
```
git clone git@github.com:jeffbanks/stargate-kiva.git
```
2. Go to the UI folder.
```
cd <github>/stargate-kiva/ui
```
3. Install *npm*.
```
npm install
```
4. Install the application.
```
REACT_APP_MAPBOX_KEY="<YOUR-KEY-GOES-HERE>" npm start
```
5. Open the application locally at [http://localhost:3000/](http://localhost:3000/).
