// Array e puntatori: aritmetica dei puntatori, e un array passato a una
// funzione (che riceve solo un puntatore: la lunghezza va passata a parte).
#include <iostream>
using namespace std;

//@region funzione
int somma(const int* v, int n) {        // v punta al primo elemento
    int s = 0;
    for (int i = 0; i < n; i++)
        s += v[i];                      // v[i] vuol dire *(v + i)
    return s;
}
//@endregion

int main() {
//@region scorri
    int a[5] = {4, 8, 15, 16, 23};                      //@decl
    int* p = a;             // a "decade" in &a[0]      //@p
    cout << *p << ' ' << *(p + 2) << ' ' << p[4] << '\n';   //@print1
    int tot = 0;                                        //@tot
    for (p = a; p != a + 5; p++)                        //@for
        tot += *p;                                      //@add
    cout << "somma con il puntatore: " << tot << '\n';  //@print2
//@endregion
    cout << "somma con la funzione:  " << somma(a, 5) << '\n';
    cout << "tra &a[1] e &a[4] ci sono " << (&a[4] - &a[1]) << " elementi\n";
    return 0;
}
