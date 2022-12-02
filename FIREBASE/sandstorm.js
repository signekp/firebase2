
// vores referencer til vores forskellige elementer / tags i vores html fil. 
// vi bruger vores document.queryselectior, som vælger ud fra tags eller classes der er blevet tildelt
const list = document.querySelector('ul');
const form = document.querySelector('.formAdd');
const listSearch = document.querySelector('.todos')
const search = document.querySelector('.search input')

// Dette er vores READ i CRUD
// Dette er vores tilføj recipe skabelon. 
// Sådan den skal stå og se ud på vores index.html
// id referer til det specifikke id i vores database
const addRecipe = (recipe, id) => {
    // todate er en property på vores created_at objekt fra vores firebase, så vi får dage i stedet for sekunder
    let time = recipe.created_at.toDate();
    // dette er html i vores template strings, så det kan tilføjes direkte til vores html side
    // vores forskellige variabler der har forskellige værdier er så indsat

    let html = `
    <li data-id="${id}">
        <div><h3>${recipe.title}</h3></div>
        <div><p class="note-body">${recipe.notes}</p></div>
        <p class="checkbox-important" id="vigtigeNoters"></p>
        <div><p class="time">${time}</p></div>
        <button class="btn btn-danger btn-sm my-2" id="deleteButton">Delete</button>
        <button class="btn btn-sm my-2" id="updateButton">Update</button>
    </li>
    `;
    // bliver vist med innerHTML her
    list.innerHTML += html;
    // dette tommer vores form for text, når vi har trykket på submit
    form.reset();

}

// Vi kalder fores 
// Dette er så vores tilføj, hvad sker der, når vi klikker submit på vores index.html side
// vi har en submit event på vores form, og vi har det på hele formen fordi det er data i input felterne der skal submittes
form.addEventListener('submit', e => {
    // her forhindrer vi en default handling på submit event, som er at den ikke vil reloade siden
    e.preventDefault();

    // checkbox
    // vi kan afkrydse "vigtige noter", på vores note, denne kode tjekker for det
    const importantNote = document.querySelector('#important');
    let importantOutput = '';

    //Hvis vores checkbox så er checket af, returnerer den en boolean med true og ellers falsk
    // vi har i en anden seperat kode, hvad der sker, hvis en checkbox så er true
    if (importantNote.checked) {
        importantOutput = true;
    } else {
        importantOutput = false;
    }

    // outputting the data
    // Vi siger new Date, så vi får det præcise tidspunkt at en bruger laver et nyt dokument
    // Dette er blevet lavet i vores firestore database, som vores created_at felt
    const now = new Date();
    const recipe = {
        // vores keys her er sat til at være lig med de data der er indsat i vores form med = 
        // Dette kan vi gøre fordi vores inputs felter i vores form har værdierne recipe og notes, så den leder automatisk ikke noget der matcher og der er noget der matcher
        title: form.recipe.value,
        notes: form.notes.value,
        Important: importantOutput,
        // Vi vil ikke kan vise en ny date, vi vil have det på samme måde, som vi har inde i vores firestore
        // så det skaber vi med at tage vores firebase objekt vi har adgang til via vores script på html
        // så siger vi .firestore til at tilgå firestore bibliotetet og siger .timespamt (som inde i firestore)
        // .fromDate med parameter hvor vi vil have datoen fra, hvilket er fra vores const new, som gav os det specifikke tidspunkt
        created_at: firebase.firestore.Timestamp.fromDate(now)

    };

    // forbindelse til vores database, vores const db fra vores index.html side. 
    // collection er en metode til at få en collection, vores collection hed så recipes og så bruger vi add metoden
    // til at tilføje vores "recipe". Her passer vi ind vores javascript objekt, som repræsenterer vores document
    // dette returnerer et promise, som vi enten vil resolve eller rejecte, promises har vores then metode. Ingen parametre fordi vi ikke prøver at hente noget
    // denne then callback function bliver affyret når vores promise er blevet resolved
    db.collection('recipes').add(recipe).then(() => {
        console.log('recipe added')

        // vores catch vil blive affyret hvis vores promise om at tilføje noget bliver rejected
    }).catch(err => {
        console.collection(err)
    })


});



// get elements

// delete function, som fx. bliver kaldt nede i vores realtime listener når vores change.type === removed
// når denne funktion kaldes, skal vi have vores id fra vores aktuelle recipe, der bliver klikket på, denne metode fjerner det fra vores template, det er allerede fjernet fra vores database
// vi indsætter parameter id, så leder vi efter vores liste efter hvilket li tag der har det der er klikket på og så kan vi fjerne det fra vores DOM
const deleteRecipe = (id) => {
    // reference til alle vores li tags
    const recipes = document.querySelectorAll('li');
    // foreach til at cycle gennem alle items, og for hvert item vil vi affyre en funktion, i denne funktion vil vi kigge på, om 
    // for hver recipe affyrer vi en funktion, som tjekker om den specifikke recipe har en data id som er det samme id som i vores parameter/argument
    // hvis der er bruger vi remove metoden til at fjerne det specifikke item.
    recipes.forEach(recipe => {
        if (recipe.getAttribute('data-id') === id) {
            recipe.remove();
        }
    })
}


// deleting data
// klik event på vores delete button der er defineret oppe i vores notesskabelon
// click event på vores list som refererer til vores liste med alle de forskellige noter
// denne sletter et dokument fra databasen
list.addEventListener('click', e => {
    // console.log(e); 
    // hvis det vi klikker på har et id med deletebutton
    if (e.target.id === 'deleteButton') {
        // variable hvor vi får parentElementet fra vores deletebutton vi klikker på, der vil vi gerne have en attribure, som er vores data id
        const id = e.target.parentElement.getAttribute('data-id');
        // metode delete (async) og returnerer et promise og så vores delete og når det gjort så console.log
        db.collection('recipes').doc(id).delete().then(() => {
            console.log('recipe deleted')
        });
    }

})

//update function til vores real-time listener funktion
// når vi skal opdatere skal vi bruge vores data og id parameter, så data er den data der er indsæt i vores felter og id er som sagt id'et på den specifikke recipe
const updateNote = (data, id) => {
    // vi laver en call back function, hvor vi har nogle variabler som forbinder vores variabler til vores DOM elementer
    let recipes = document.querySelector(`li[data-id="${id}"]`);
    let importantNote = recipes.querySelector('.checkbox-important');
    let title = recipes.querySelector('h3');
    let notes = recipes.querySelector('.note-body');

    // her sætter vi vores data.titles og data.notes til at være den værdi, som er indtastet i vores h3 og .notebody i html
    title.innerText = data.title;
    notes.innerText = data.notes;

    // her tjekker vi for, om importent note er blevet krydset eller ej. 
    // Vi har et felt i vores collection der hedder Important der returnerer en boolean true/false
    // hvis vores Important er true, så displayer den 
    if (data.Important) {
        importantNote.style.display = 'inline-block';
    }

    else {
        // hvis vores important er false, får den en display none (bliver ikke vist)
        importantNote.style.display = 'none';
    }
    form.reset();
};


// update event listener for vores update, vi har et click event
// refererer til alle vores forskellige noter med e som argument, 
list.addEventListener('click', e => {
    e.preventDefault();
    // så hvis e.target.id, hvis en specifik note med et id får klikket på uddate button gør vi noget
    if (e.target.id === 'updateButton') {
        // først tjekker vi om der bliver klikket på important noget
        const id = e.target.parentElement.getAttribute('data-id');
        const importantNote = document.querySelector('#important');
        let importantOutput = '';
        //Hvis ja, så er important note true ellers false
        if (importantNote.checked) {
            importantOutput = true;
        } else {
            importantOutput = false;
        }
        // her laver vi så vores update note
        // så det der bliver skrevet i vores notes og vores title samt important note, tager værdierne fra vores input
        // når vi så klikker på vores update button
        const updateNote = {
            notes: form.notes.value,
            title: form.recipe.value,
            Important: importantOutput
        };
        // vores forbindelse til databasen med recipes, så vi siger det specifikke dokument med specifik id og bruger update metode på den
        // og har vores const updateNote som parameter, den returnerer et promise så vi kan bruge then metoden, og når det promiser så resolver affyrer den console.log
        db.collection('recipes').doc(id).update(updateNote).then(() => {
            console.log('Note updated!');
        });
    }

})



// real time
// dette er det der gør, at vi får vist vores dokumenter på siden når vi skaber, opdaterer sletter. 
// Uden denne, vil der stadig blive skabt en ny note, men den vil så kun blive vist i vores firestore
// vi får vores collection recipes fra vores db (database), og bruger snapchot metoden på den, som affyrer en call back funktion med hvert element

db.collection('recipes').onSnapshot(snapshot => {
    // docchanges som giver os en array med docchanging og så bruger vi en foreach for det vi får tilbage, er altid en array
    snapshot.docChanges().forEach(change => {
        // dette giver os det aktuelle dokument
        const doc = change.doc;
        // vi har en type property på vores change, og hvis den er === til added
        if (change.type === "added") {
            // så kalder vi vores addRecipe funktion og tager vores doc.data som er data på vores recipe og id'et som arguments
            addRecipe(doc.data(), doc.id);
        }

        else if (change.type === "removed") {
            deleteRecipe(doc.id);
            return;

        } else if (change.type === "modified") {
            updateNote(doc.data(), doc.id);


        }


        // checkmark
        let getID = document.querySelector(`li[data-id="${doc.id}"]`);
        let importantText = getID.querySelector('.checkbox-important')

        if (doc.get('Important') === true) {
            importantText.innerText = 'important'
        }
        else {
            importantText.innerText = '';
        }




    });

});









// search

const filterTodos = (term) => {
    Array.from(list.children)
        .filter((todo) => !todo.textContent.toLowerCase().includes(term))
        .forEach((todo) => todo.classList.add('filtered'));

    Array.from(list.children)
        .filter((todo) => todo.textContent.toLowerCase().includes(term))
        .forEach((todo) => todo.classList.remove('filtered'));
};

//key event search

search.addEventListener('keyup', () => {
    const term = search.value.trim().toLowerCase();
    filterTodos(term)
})


// Show only importans

const importantSearch = document.querySelector('.searchImportant')

importantSearch.addEventListener('click', e => {

    if (document.getElementById('filter_IN').checked) {

        db.collection('recipes').onSnapshot(snapshot => {
            snapshot.docs.forEach(doc => {

                const id = doc.id;
                const data = doc.data();
                const card = document.querySelector(`li[data-id="${id}"]`);

                if (data.Important != true) {
                    card.style.display = 'none';

                }
            })
        });
    }

    else {
        db.collection('recipes').onSnapshot(snapshot => {
            snapshot.docs.forEach(doc => {

                const id = doc.id;
                const card = document.querySelector(`li[data-id="${id}"]`);
                const searchForinput = document.querySelector('#searchID');

                card.style.display = 'inline-block';
                searchForinput.value = '';

            })


        })
    }
})
