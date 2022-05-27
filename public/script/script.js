// Déclaration des variables en amont 
let fashion = document.getElementById('fashion')
let panier = document.getElementById('panier')
let vosArticles = document.getElementById('vosArticles')
let password = document.getElementById("password")
let name = document.getElementById("name")
let surname = document.getElementById("surname")
let emailAddress = document.getElementById("emailAddress")
let submit = document.getElementById("submit")
let confirmPassword = document.getElementById("confirmPassword")
let page = document.getElementById("page")

let myCartArray = [] // va contenir les articles que l'utilisateur souhaite acheter
let allArticlesArray = [] // va contenir tous les éléments du json
let panierCount = 0 // va être le compteur du panier


// fonction permettant de créer une card à l'aide d'un objet contenant des infos : img, prix, etc ...
function createCard(myObject) {
    fashion.insertAdjacentHTML('beforeend', `
    <div class="card my-2 col-lg-3 col-10 mx-2">
        <div id="carousel-${myObject.id}" class="carousel carousel-dark slide" data-bs-ride="carousel" >
            <div class="carousel-inner">
                <div class="carousel-item active" data-bs-interval="10000">
                <img style="width:100%" src="public/img/${myObject.imgs[0]}" alt="vue vêtement de face">
                </div>
                <div class="carousel-item" data-bs-interval="2000">
                <img style="width:100%" src="public/img/${myObject.imgs[1]}" alt="vue vêtement de dos">
                </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${myObject.id}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carousel-${myObject.id}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
        <div class="card-body">
            <p class="txtSize">${myObject.name}</p>
            <div class="d-flex  justify-content-between align-items-center ">
                <div class="fw-bold">${myObject.price}€</div>
                <button id="${myObject.id}-btn" class="btn p-2 smoll-text" onclick="addToCart('${myObject.id}')">Ajouter au panier</button>
            </div>
        </div>
    </div>
    `)
}


// fetch permettant de recupérer les données du json
fetch('public/data/dress.json')
    .then(response => response.json())
    .then(data => {
        // utilisation d'une boucle 'for in' pour récuperer la valeur de l'index de chaque élément
        for (let index in data.results) {
            // nous poussons les éléments dans un tableau pour le manipuler par la suite
            allArticlesArray.push(data.results[index])
            // Nous utilisons notre fonction createCard pour insérer nos articles
            createCard(data.results[index])
        } // de la boucle for in
    }) // fin du then data


// la fonction va remplir un tableau myCartArray contenent toutes les propriétés de l'article, puis l'affichera ou augmentera la quantité dans la modal du panier
function addToCart(articleRef) {

    console.log(myCartArray)

    // nous allons utiliser notre fonction getItemIndex() pour recupérer l'index si présent sinon false si absent du tableau
    let index = getItemIndex(myCartArray, articleRef)

    // si absent, on pousse l'item dans le tableau à l'aide de .push()
    if (index === false) {
        // on récupère l'indexArticle à l'aide de notre fonction
        let indexArticle = getItemIndex(allArticlesArray, articleRef)
        myCartArray.push(allArticlesArray[indexArticle])
        calculSousTotal(articleRef)
    } else {
        // sinon nous augmentons la quantité de l'article en le ciblant à l'aide de l'index
        myCartArray[index].quantity++
        calculSousTotal(articleRef)
    }

    // Ca permet de vider tous les éléments dans la modal panier
    vosArticles.innerHTML = ''

    // NE PAS TOUCHER A CETTE BOUCLE CAR ELLE NE FAIT QUE AFFICHER LE TABLEAU "myCartArray"
    // boucle permettant de remplir le panier en fonction de notre tableau myCartArray
    myCartArray.forEach(element => {
        vosArticles.insertAdjacentHTML('beforeend', `
                <div class="card mt-1" id="${element.id}">
                    <div class="row g-0">
                        <div class="col-lg-2 col-2">
                            <img  style="width:100%" src="public/img/${element.imgs[0]}" alt="vêtement dans votre panier">
                        </div>
                        <div class="col-lg-10 col-10">
                            <div class="card-body">
                                <div class="d-flex justify-content-between mb-2">
                                    <p class="card-title fw-bold">${element.name}</p>
                                    <a type="button" class="mx-1 aH my-0 p-0 text-dark fw-bold btn-sm d-flex align-items-end" onclick="removeToCart('${element.id}')">
                                        <i class="bi bi-trash3"></i>
                                    </a>
                                </div>
                                <div class="d-flex justify-content-evenly">
                                    <p class="mx-1 card-title">ref : ${element.id}</p>
                                    <p class="mx-1 card-text">${element.price}€</p>
                                    <input id="input-${element.id}"type="number" class="mx-1 p-0 taille" min="1" value="${element.quantity}" onchange="changeQuantity('${element.id}')">
                                    <p class="mx-1 card-text" data-soustotal id="priceByQuantity-${element.id}">${element.priceByQuantity}€</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `)

    }) // FIN DE BOUCLE 
    // NE PAS TOUCHER A CETTE BOUCLE

}


// Fonction permettant de supprimer l'article du panier
function removeToCart(articleRef) {
    // nous utilisons la fonction pour rechercher l'index de l'article pour le supprimer par la suite
    let indexInCartArray = getItemIndex(myCartArray, articleRef)
    // Nous passons la quantity de l'article à 1 pour ne pas garder l'historique des quantités
    myCartArray[indexInCartArray].quantity = 1
    // puis nous supprimons l'article dans le cart array
    myCartArray.splice(indexInCartArray, 1)

    // Il nous reste plus que de le supprimer dans notre modal à l'aide de la fonction remove()
    let articleToRemove = document.getElementById(articleRef)
    articleToRemove.remove()

    calculTotalItem()
    calculTotal()
}


// Fonction permettant de rechercher un élément dans un tableau : return l'index de l'élément s'il trouve, sinon return false
function getItemIndex(array, article) {
    // on détermine une variable nous permettant de connaitre si oui ou non l'item est present dans le tableau
    let inArrayIndex = false;
    // on parcourt le tableau à l'aide d'une boucle for pour retrouver l'id de l'article
    array.forEach((value, index) => {
        if (value.id == article) {
            // si présent on passe la variable à true
            inArrayIndex = index
        }
    })
    // retourne la valeur de la variable
    return inArrayIndex;
}


function showClothes() {
    let mainView = document.getElementById('mainView');
    let landingPage = document.getElementById('landingPage')
    let registerYourself = document.getElementById("registerYourself")
    mainView.style.display = 'block';
    landingPage.style.display = 'none';
    registerYourself.style.display = "none";
}

///////////////////////////////////////////////////////////
// fonctions pour le formulaire
function register() {
    mainView.style.display = 'none';
    landingPage.style.display = 'none';
    registerYourself.style.display = "block";
}


function validForm() {
    if (surname.value == "") {
        errorsurname.innerHTML = `<p class="text-danger">*Merci de bien vouloir renseigner votre Nom</p>`
        surname.style.backgroundColor = `pink`
    } else {
        errorsurname.innerHTML = ""
        surname.style.backgroundColor = ""
    }
    if (name.value == "") {
        errorname.innerHTML = `<p class="text-danger">*Merci de bien vouloir renseigner votre Prénom</p>`
        name.style.backgroundColor = `pink`
    } else if (name.value != "") {
        errorname.innerHTML = ""
        name.style.backgroundColor = ""
    }
    if (emailAddress.value == "") {
        erroremailAddress.innerHTML = `<p class="text-danger">*Merci de bien vouloir renseigner votre email</p>`
        emailAddress.style.backgroundColor = `pink`
    } else if (emailAddress.value != "") {
        erroremailAddress.innerHTML = ""
        emailAddress.style.backgroundColor = ""
    }
    if (checkbox.checked == false) {
        errorcheckbox.innerHTML = `<p class="text-danger">*Merci de bien vouloir valider les CGU</p>`
    } else if (checkbox.checked == true) {
        errorcheckbox.innerHTML = ""
    }
    if (password.value == "") {
        errorpassword.innerHTML = `<p class="text-danger">*Merci de bien vouloir renseigner votre mot de passe</p>`
        password.style.backgroundColor = `pink`
    } else if (password.value != "") {
        errorpassword.innerHTML = ""
        password.style.backgroundColor = ""
    }
    if (confirmPassword.value == "") {
        errorconfirmPassword.innerHTML = `<p class="text-danger">*Merci de bien vouloir confirmer votre mot de passe</p>`
        confirmPassword.style.backgroundColor = `pink`
    }
    if (confirmPassword.value != password.value) {
        errorconfirmPassword.innerHTML = `<p class="text-danger">*Veuillez rentrer un MDP identique</p>`
        confirmPassword.style.backgroundColor = `pink`

    } else if (confirmPassword.value != "" && confirmPassword.value == password.value) {
        errorconfirmPassword.innerHTML = ""
        confirmPassword.style.backgroundColor = ""
    }
    if (surname.value != "" && name.value != "" && password.value != "" && emailAddress.value != "" && confirmPassword.value == password.value && checkbox.checked == true) {
        mainView.style.display = 'none';
        landingPage.style.display = 'block';
        registerYourself.style.display = "none";
    }
}


function cleanError(id) {
    let errormessage = document.getElementById("error" + id)
    errormessage.innerHTML = ""
    let background = document.getElementById(id)
    background.style.backgroundColor = ""
}
// fonctions pour le formulaire
///////////////////////////////////////////////////////////


// fonction permettant de filtrer les éléments que nous souhaitons voir afficher
function trierArticle() {

    // On cible les checkbox à l'aide de leurs id respectifs
    let robe = document.getElementById("robe")
    let blouse = document.getElementById("blouse")
    let tshirt = document.getElementById("tshirt")
    let debardeur = document.getElementById("debardeur")
    let bas = document.getElementById("bas")
    let ensemble = document.getElementById("ensemble")
    let combinaison = document.getElementById("combinaison")

    let choicesArray = [] // tableau vide qui va contenir le ou les choix

    // Nous controllons si les filtres respectifs sont cochés, si oui nous poussons le choix dans un tableau
    // Sinon, on l'efface dans le tableau
    // Nous enchaînons donc les if : à factoriser par la suite
    if (robe.checked == true) {
        choicesArray.push('robe')
    } else if (choicesArray.indexOf('robe') > 0) {
        // On recupère l'index et on le supprime du tableau à l'aide d'un splice
        choicesArray.splice(choicesArray.indexOf('robe'), 1)
    }

    if (blouse.checked == true) {
        choicesArray.push('blouse')
    } else if (choicesArray.indexOf('blouse') > 0) {
        choicesArray.splice(choicesArray.indexOf('blouse'), 1)
    }

    if (tshirt.checked == true) {
        choicesArray.push('tshirt')
    } else if (choicesArray.indexOf('tshirt') > 0) {
        choicesArray.splice(choicesArray.indexOf('tshirt'), 1)
    }

    if (debardeur.checked == true) {
        choicesArray.push('debardeur')
    } else if (choicesArray.indexOf('debardeur') > 0) {
        choicesArray.splice(choicesArray.indexOf('debardeur'), 1)
    }

    if (bas.checked == true) {
        choicesArray.push('bas')
    } else if (choicesArray.indexOf('bas') > 0) {
        choicesArray.splice(choicesArray.indexOf('bas'), 1)
    }

    if (ensemble.checked == true) {
        choicesArray.push('ensemble')
    } else if (choicesArray.indexOf('ensemble') > 0) {
        choicesArray.splice(choicesArray.indexOf('ensemble'), 1)
    }

    if (combinaison.checked == true) {
        choicesArray.push('combinaison')
    } else if (choicesArray.indexOf('combinaison') > 0) {
        choicesArray.splice(choicesArray.indexOf('combinaison'), 1)
    }

    // Nous effacons les éléments présent
    fashion.innerHTML = ''

    allArticlesArray.forEach(article => {
        // si le tableau de choix est vide alors nous affichons tout, sinon ...
        if (choicesArray.length < 1) {
            createCard(article)
        } else {
            // nous allons parcourir les elements de categorie pour afficher les choix du filtre
            article.category.forEach(category => {
                // si nous trouvons la catégory choisie, nous créons la carte à l'aide de la fonction
                if (choicesArray.indexOf(category) >= 0) {
                    createCard(article)
                    return // pour sortir de la réitération
                }
            })
        }
    })
}

// fonction qui permet de faire le sous total dans le panier selon la ref renseigné 
function calculSousTotal(articleRef) {
    // nous recherchons l'index du l'article afin de calculer le sous total
    let indexInArray = getItemIndex(myCartArray, articleRef)
    myCartArray[indexInArray].priceByQuantity = +myCartArray[indexInArray].quantity * +myCartArray[indexInArray].price
    calculTotalItem()
    calculTotal()
}

// fonction qui permet de faire le total du panier en fonction des sous totaux
function calculTotal() {
    let totalDiv = document.getElementById('totalDiv')
    let total = 0
    myCartArray.forEach(article => {
        total += +article.priceByQuantity
    })
    // Nous écrivons le total dans le panier dans la div correspondante
    totalDiv.innerText = `Total : ${total}€`
}

// fonction permettant de calculer le total 
function calculTotalItem() {
    let totalArticle = 0
    let totalArticlePanier = document.getElementById('totalArticlePanier')
    myCartArray.forEach(article => {
        totalArticle += +article.quantity
    })
    // Nous écrivons le résultat dans la pastille rouge
    totalArticlePanier.innerText = totalArticle
}

function changeQuantity(articleRef) {
    let input = document.getElementById('input-' + articleRef)
    let indexInArray = getItemIndex(myCartArray, articleRef)
    // Nous récupérons la valeur de l'input suite au changement et nous modifions la valeur quantity de l'objet dans la panier
    myCartArray[indexInArray].quantity = +input.value
    // Nous effectuons le sous calcul dans le tableau du panier
    calculSousTotal(articleRef)
    // Enfin nous affichons le sous total directement dans le panier pour éviter de relancer l'écriture du panier en entier
    let priceByQuantity = document.getElementById('priceByQuantity-' + articleRef)
    priceByQuantity.innerText = myCartArray[indexInArray].priceByQuantity + '€'

}