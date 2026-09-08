const meals = document.getElementById("meals");
const favContainer = document.getElementById("fav-meals");

const searchTerm = document.getElementById("search-term");
const searchButton = document.getElementById("search-button");

const mealPopup = document.getElementById("meal-popup");
const closePopupBtn = document.getElementById("close-popup");

closePopupBtn.addEventListener("click", () => {
  mealPopup.style.display = "none";
});

searchTerm.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchButton.click();
  }
});

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php",
  );

  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id,
  );

  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}

async function getMealBySearch(term) {
  const mealSearch = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term,
  );

  const mealSearchData = await mealSearch.json();
  const meals = mealSearchData.meals;
  return meals;
}

function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.dataset.id = mealData.idMeal;

  meal.innerHTML = `
          <div class="meal-header">
          ${
            random
              ? `
            <span class="random"> Recipe of the Day </span>`
              : "  "
          }
            <img
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
            />
          </div>
          <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
              <i class="fa-regular fa-bookmark"></i>
            </button>
          </div>
        `;

  const btn = meal.querySelector(".meal-body .fav-btn");
  const icon = btn.querySelector("i");

  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealFromLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealToLS(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();

    icon.classList.toggle("fa-regular");
    icon.classList.toggle("fa-solid");
  });

  meals.appendChild(meal);
}

function addMealToLS(mealId) {
  const mealIds = getMealFromLS();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
  const mealIds = getMealFromLS();
  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId)),
  );
}

// get meals from local storage

function getMealFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}
async function fetchFavMeals() {
  // clear the fav meals container and fetch the updated list of favorite meals

  favContainer.innerHTML = "";

  const mealIds = getMealFromLS();

  const meals = [];

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);
    addMealToFav(meal);
  }
}

// add the fav meals to the screen
function addMealToFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
          
            <img
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
            /><span>${mealData.strMeal}</span>
            <button class="clear"><i class="fa-solid fa-xmark"></i></button>


          
        `;

  const btn = favMeal.querySelector(".clear");
  btn.addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);
    favContainer.removeChild(favMeal);
    btn.classList.remove("active");
    fetchFavMeals();
    updateMealFavButtons();
  });
  favContainer.appendChild(favMeal);
}

function updateMealFavButtons() {
  const mealIds = getMealFromLS();

  document.querySelectorAll(".meal").forEach((meal) => {
    const id = meal.dataset.id;
    const btn = meal.querySelector(".fav-btn");
    const icon = btn.querySelector("i");

    if (mealIds.includes(id)) {
      btn.classList.add("active");
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
    } else {
      btn.classList.remove("active");
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
    }
  });
}

searchButton.addEventListener("click", async () => {
  const search = searchTerm.value.trim();
  if (!search) return;

  const mealsList = await getMealBySearch(search);

  meals.innerHTML = ""; // clear the meals container before adding new meals

  if (mealsList) {
    mealsList.forEach((meal) => addMeal(meal));
  } else {
    meals.innerHTML = "<p>No recipes found.</p>";
  }
});
