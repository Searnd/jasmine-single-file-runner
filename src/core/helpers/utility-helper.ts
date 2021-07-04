export class UtilityHelper {  
    public groupBy(xs: any, key: any): any {
      return xs.reduce((rv: any, x: any) => {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    }
  
    public removeElementsFromArrayWithoutModifyingIt(elements?: any[], elementsToRemove?: any[] | any): any[] {
      if (elements === undefined) {
        return [];
      }
  
      if (Array.isArray(elementsToRemove)) {
        return elements.filter(element => {
          if (typeof element === "object") {
            const key = Object.keys(element)[0];
            return !elementsToRemove.some(x => key in x);
          }
  
          return elementsToRemove.indexOf(element) < 0;
        });
      } else {
        return elements.filter(element => {
          return elementsToRemove !== element;
        });
      }
    }
  }
  