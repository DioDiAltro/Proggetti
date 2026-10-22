// Costruzione di un max-heap in tempo O(n) (build-heap) e heapsort.
// Indici da 0: i figli di i sono 2i+1 e 2i+2.
#include <iostream>
#include <vector>
using namespace std;

//@region sort
//@region build
// a[i] scende finché è più piccolo di un figlio.
// Usa solo a[0..n-1]: n = dimensione dell'heap.
void siftDown(vector<int>& a, int i, int n) {
    while (2 * i + 1 < n) {                //@down-loop
        int m = 2 * i + 1, r = 2 * i + 2;  //@down-kids
        if (r < n && a[r] > a[m]) m = r;   //@down-max
        if (a[i] >= a[m]) return;          //@down-stop
        swap(a[i], a[m]);                  //@down-swap
        i = m;                             //@down-move
    }
}

// Dall'ultimo nodo interno fino alla radice.
void buildHeap(vector<int>& a) {
    int n = a.size();
    for (int i = n / 2 - 1; i >= 0; i--)   //@build-loop
        siftDown(a, i, n);                 //@build-down
}
//@endregion build

void heapSort(vector<int>& a) {
    int n = a.size();
    buildHeap(a);                          //@hs-build
    for (int i = n - 1; i > 0; i--) {      //@hs-loop
        swap(a[0], a[i]);   // max in fondo  //@hs-swap
        siftDown(a, 0, i);  // a[0..i-1]     //@hs-down
    }
}
//@endregion sort

void stampa(const char* titolo, const vector<int>& a) {
    cout << titolo;
    for (int x : a) cout << ' ' << x;
    cout << '\n';
}

int main() {
    vector<int> a = {5, 13, 2, 25, 7, 17, 20, 8};
    stampa("input:     ", a);

    vector<int> h = a;
    buildHeap(h);
    stampa("buildHeap: ", h);

    heapSort(a);
    stampa("ordinato:  ", a);
    return 0;
}
