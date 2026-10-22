// Alberi binari: il nodo, tre funzioni ricorsive (conta, altezza, somma),
// le visite in profondità (preordine, simmetrica, postordine) e la visita
// per livelli con una coda.
#include <algorithm>
#include <iostream>
#include <queue>
using namespace std;

//@region nodo
struct Nodo {
    int key;
    Nodo* left;    // figlio sinistro (nullptr se non c'è)
    Nodo* right;   // figlio destro   (nullptr se non c'è)
    Nodo(int k) : key(k), left(nullptr), right(nullptr) {}
};
//@endregion

//@region ricorsive
int contaNodi(Nodo* t) {
    if (t == nullptr) return 0;     // albero vuoto
    return 1 + contaNodi(t->left) + contaNodi(t->right);
}

//@region altezza
int altezza(Nodo* t) {
    if (t == nullptr) return -1;                       //@h-base
    int hs = altezza(t->left);                         //@h-left
    int hd = altezza(t->right);                        //@h-right
    return 1 + max(hs, hd);                            //@h-ret
}
//@endregion altezza

int somma(Nodo* t) {
    if (t == nullptr) return 0;
    return t->key + somma(t->left) + somma(t->right);
}
//@endregion ricorsive

//@region visite
void preorder(Nodo* t) {
    if (t == nullptr) return;                          //@pre-null
    cout << t->key << ' ';                             //@pre-visit
    preorder(t->left);                                 //@pre-left
    preorder(t->right);                                //@pre-right
}                                                      //@pre-end

void inorder(Nodo* t) {
    if (t == nullptr) return;                          //@in-null
    inorder(t->left);                                  //@in-left
    cout << t->key << ' ';                             //@in-visit
    inorder(t->right);                                 //@in-right
}                                                      //@in-end

void postorder(Nodo* t) {
    if (t == nullptr) return;                          //@post-null
    postorder(t->left);                                //@post-left
    postorder(t->right);                               //@post-right
    cout << t->key << ' ';                             //@post-visit
}                                                      //@post-end
//@endregion

//@region livelli
void perLivelli(Nodo* radice) {
    if (radice == nullptr) return;
    queue<Nodo*> q;                    // coda FIFO
    q.push(radice);                                    //@bfs-root
    while (!q.empty()) {                               //@bfs-loop
        Nodo* t = q.front();                           //@bfs-front
        q.pop();                                       //@bfs-pop
        cout << t->key << ' ';                         //@bfs-visit
        if (t->left != nullptr) q.push(t->left);       //@bfs-left
        if (t->right != nullptr) q.push(t->right);     //@bfs-right
    }
}
//@endregion

//@region distruggi
// Libera tutti i nodi, in postordine: prima i figli,
// poi il nodo (dopo delete t, t->left non si legge più).
void distruggi(Nodo* t) {
    if (t == nullptr) return;
    distruggi(t->left);
    distruggi(t->right);
    delete t;
}
//@endregion

int main() {
    // L'albero dell'esempio: 10 ha figli 4 e 7; 4 ha figli 2 e 9;
    // 9 ha figli 1 e 8; 7 ha solo il figlio destro 5.
    Nodo* radice = new Nodo(10);
    radice->left = new Nodo(4);
    radice->right = new Nodo(7);
    radice->left->left = new Nodo(2);
    radice->left->right = new Nodo(9);
    radice->left->right->left = new Nodo(1);
    radice->left->right->right = new Nodo(8);
    radice->right->right = new Nodo(5);

    cout << "nodi: " << contaNodi(radice) << ", altezza: " << altezza(radice)
         << ", somma: " << somma(radice) << '\n';
    cout << "preordine:   ";
    preorder(radice);
    cout << "\nsimmetrica:  ";
    inorder(radice);
    cout << "\npostordine:  ";
    postorder(radice);
    cout << "\nper livelli: ";
    perLivelli(radice);
    cout << '\n';

    distruggi(radice);
    return 0;
}
