// Rotazioni in un albero binario di ricerca: cambiano la forma
// dell'albero (e la sua altezza) ma non l'ordine delle chiavi.
#include <algorithm>
#include <iostream>
using namespace std;

struct Nodo {
    int key;
    Nodo* left;
    Nodo* right;
    Nodo(int k) : key(k), left(nullptr), right(nullptr) {}
};

//@region rotazioni
// y, figlio destro di x, sale; x scende a sinistra.
// Restituisce la nuova radice del sottoalbero.
Nodo* ruotaSinistra(Nodo* x) {
    Nodo* y = x->right;      //@rl-y
    x->right = y->left;      //@rl-beta
    y->left = x;             //@rl-x
    return y;                //@rl-ret
}

// Il caso simmetrico: x è figlio sinistro di y.
Nodo* ruotaDestra(Nodo* y) {
    Nodo* x = y->left;       //@rr-x
    y->left = x->right;      //@rr-beta
    x->right = y;            //@rr-y
    return x;                //@rr-ret
}
//@endregion

Nodo* inserisci(Nodo* t, int k) {
    if (t == nullptr) return new Nodo(k);
    if (k < t->key)
        t->left = inserisci(t->left, k);
    else if (k > t->key)
        t->right = inserisci(t->right, k);
    return t;
}

int altezza(Nodo* t) {
    if (t == nullptr) return -1;
    return 1 + max(altezza(t->left), altezza(t->right));
}

void preorder(Nodo* t) {
    if (t == nullptr) return;
    cout << t->key << ' ';
    preorder(t->left);
    preorder(t->right);
}

void inorder(Nodo* t) {
    if (t == nullptr) return;
    inorder(t->left);
    cout << t->key << ' ';
    inorder(t->right);
}

void stampa(const char* titolo, Nodo* t) {
    cout << titolo << "  preordine: ";
    preorder(t);
    cout << "| simmetrica: ";
    inorder(t);
    cout << "| altezza " << altezza(t) << '\n';
}

void distruggi(Nodo* t) {
    if (t == nullptr) return;
    distruggi(t->left);
    distruggi(t->right);
    delete t;
}

int main() {
    // Le chiavi inserite in ordine crescente danno una catena.
    Nodo* radice = nullptr;
    for (int k : {10, 20, 30})
        radice = inserisci(radice, k);
    stampa("catena     ", radice);

    // Una rotazione a sinistra sulla radice la bilancia.
    radice = ruotaSinistra(radice);
    stampa("a sinistra ", radice);

    // La rotazione a destra la riporta com'era.
    radice = ruotaDestra(radice);
    stampa("a destra   ", radice);

    // Una rotazione su un nodo interno: il padre riaggancia
    // la nuova radice del sottoalbero.
    for (int k : {40, 50})
        radice = inserisci(radice, k);
    stampa("catena     ", radice);
    radice->right = ruotaSinistra(radice->right);
    stampa("su 20      ", radice);

    distruggi(radice);
    return 0;
}
