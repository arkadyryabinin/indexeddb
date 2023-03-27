(function () {
  console.log('hello');
  const customerData = [
    { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
    { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
  ];

  if (!('indexedDB' in window)) {
    console.log("This browser doesn't support IndexedDB");
    return;
  }

  const dbName = "my-test-database-5";

  const request = indexedDB.open(dbName, 8);
  console.log(request);

  request.onerror = (event) => {
    console.log("Error", event.target.error);
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    db.onversionchange = function() {
      db.close();
      document.location.reload();
      console.log("Database is outdated, please reload the page.");
    };
  }


  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    console.log(event);

    // Create an objectStore to hold information about our customers. We're
    // going to use "ssn" as our key path because it's guaranteed to be
    // unique - or at least that's what I was told during the kickoff meeting.

    if (event.oldVersion !== 0) db.deleteObjectStore('customers');
    const objectStore = db.createObjectStore("customers", { keyPath: "ssn" });

    // Create an index to search customers by name. We may have duplicates
    // so we can't use a unique index.
    objectStore.createIndex("name", "name", { unique: false });

    // Create an index to search customers by email. We want to ensure that
    // no two customers have the same email, so use a unique index.
    objectStore.createIndex("email", "email", { unique: true });

    // Use transaction oncomplete to make sure the objectStore creation is
    // finished before adding data into it.
    objectStore.transaction.oncomplete = (event) => {
      // Store values in the newly created objectStore.
      const customerObjectStore = db
        .transaction("customers", "readwrite")
        .objectStore("customers");
      customerData.forEach((customer) => {
        customerObjectStore.add(customer);
      });
    };
  };
})();